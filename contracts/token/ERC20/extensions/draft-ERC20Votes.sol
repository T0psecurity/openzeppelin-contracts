// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./draft-ERC20Permit.sol";
import "./draft-IERC20Votes.sol";
import "../../../utils/math/Math.sol";
import "../../../utils/math/SafeCast.sol";
import "../../../utils/cryptography/ECDSA.sol";

/**
 * @dev Extension of the ERC20 token contract to support Compound's voting and delegation.
 *
 * This extensions keeps a history (checkpoints) of each account's vote power. Vote power can be delegated either
 * by calling the {delegate} function directly, or by providing a signature to be used with {delegateBySig}. Voting
 * power can be queried through the public accessors {getCurrentVotes} and {getPriorVotes}.
 *
 * By default, token balance does not account for voting power. This makes transfers cheaper. The downside is that it
 * requires users to delegate to themselves in order to activate checkpoints and have their voting power tracked.
 * Enabling self-delegation can easily be done by overriding the {delegates} function. Keep in mind however that this
 * will significantly increase the base gas cost of transfers.
 *
 * _Available since v4.2._
 */
abstract contract ERC20Votes is IERC20Votes, ERC20Permit {
    bytes32 private constant _DELEGATION_TYPEHASH = keccak256("Delegation(address delegatee,uint256 nonce,uint256 expiry)");

    mapping (address => address) private _delegates;
    mapping (address => Checkpoint[]) private _checkpoints;

    /**
     * @dev Get the `pos`-th checkpoint for `account`.
     */
    function checkpoints(address account, uint32 pos) external view virtual override returns (Checkpoint memory) {
        return _checkpoints[account][pos];
    }

    /**
     * @dev Get number of checkpoints for `account`.
     */
    function numCheckpoints(address account) external view virtual override returns (uint32) {
        return SafeCast.toUint32(_checkpoints[account].length);
    }

    /**
     * @dev Get the address `account` is currently delegating to.
     */
    function delegates(address account) public view virtual override returns (address) {
        return _delegates[account];
    }

    /**
     * @dev Gets the current votes balance for `account`
     */
    function getCurrentVotes(address account) external view override returns (uint256) {
        uint256 pos = _checkpoints[account].length;
        return pos == 0 ? 0 : _checkpoints[account][pos - 1].votes;
    }

    /**
     * @dev Determine the number of votes for `account` at the begining of `blockNumber`.
     */
    function getPriorVotes(address account, uint256 blockNumber) external view override returns (uint256) {
        require(blockNumber < block.number, "ERC20Votes::getPriorVotes: not yet determined");

        Checkpoint[] storage ckpts = _checkpoints[account];

        // We run a binary search to look for the earliest checkpoint taken after `blockNumber`.
        //
        // During the loop, the index of the wanted checkpoint remains in the range [low, high).
        // With each iteration, either `low` or `high` is moved towards the middle of the range to maintain the invariant.
        // - If the middle checkpoint is after `blockNumber`, we look in [low, mid)
        // - If the middle checkpoint is before `blockNumber`, we look in [mid+1, high)
        // Once we reach a single value (when low == high), we've found the right checkpoint at the index high-1, if not
        // out of bounds (in which case we're looking too far in the past and the result is 0).
        // Note that if the latest checkpoint available is exactly for `blockNumber`, we end up with an index that is
        // past the end of the array, so we technically don't find a checkpoint after `blockNumber`, but it works out
        // the same.
        uint256 high = ckpts.length;
        uint256 low = 0;
        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (ckpts[mid].fromBlock > blockNumber) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        return high == 0 ? 0 : ckpts[high - 1].votes;
    }

    /**
     * @dev Delegate votes from the sender to `delegatee`.
     */
    function delegate(address delegatee) public virtual override {
        return _delegate(_msgSender(), delegatee);
    }

    /**
     * @dev Delegates votes from signer to `delegatee`
     */
    function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s)
        public virtual override
    {
        require(block.timestamp <= expiry, "ERC20Votes::delegateBySig: signature expired");
        address signer = ECDSA.recover(
            _hashTypedDataV4(keccak256(abi.encode(
                _DELEGATION_TYPEHASH,
                delegatee,
                nonce,
                expiry
            ))),
            v, r, s
        );
        require(nonce == _useNonce(signer), "ERC20Votes::delegateBySig: invalid nonce");
        return _delegate(signer, delegatee);
    }

    /**
     * @dev Change delegation for `delegator` to `delegatee`.
     */
    function _delegate(address delegator, address delegatee) internal virtual {
        address currentDelegate = delegates(delegator);
        uint256 delegatorBalance = balanceOf(delegator);
        _delegates[delegator] = delegatee;

        emit DelegateChanged(delegator, currentDelegate, delegatee);

        _moveVotingPower(currentDelegate, delegatee, delegatorBalance);
    }

    function _moveVotingPower(address src, address dst, uint256 amount) private {
        if (src != dst && amount > 0) {
            if (src != address(0)) {
                uint256 srcCkptLen = _checkpoints[src].length;
                uint256 srcCkptOld = srcCkptLen == 0 ? 0 : _checkpoints[src][srcCkptLen - 1].votes;
                uint256 srcCkptNew = srcCkptOld - amount;
                _writeCheckpoint(src, srcCkptLen, srcCkptOld, srcCkptNew);
            }

            if (dst != address(0)) {
                uint256 dstCkptLen = _checkpoints[dst].length;
                uint256 dstCkptOld = dstCkptLen == 0 ? 0 : _checkpoints[dst][dstCkptLen - 1].votes;
                uint256 dstCkptNew = dstCkptOld + amount;
                _writeCheckpoint(dst, dstCkptLen, dstCkptOld, dstCkptNew);
            }
        }
    }

    function _writeCheckpoint(address delegatee, uint256 pos, uint256 oldWeight, uint256 newWeight) private {
      if (pos > 0 && _checkpoints[delegatee][pos - 1].fromBlock == block.number) {
          _checkpoints[delegatee][pos - 1].votes = SafeCast.toUint224(newWeight);
      } else {
          _checkpoints[delegatee].push(Checkpoint({
              fromBlock: SafeCast.toUint32(block.number),
              votes: SafeCast.toUint224(newWeight)
          }));
      }

      emit DelegateVotesChanged(delegatee, oldWeight, newWeight);
    }

    function _mint(address account, uint256 amount) internal virtual override {
        super._mint(account, amount);
        require(totalSupply() <= type(uint224).max, "ERC20Votes: total supply exceeds 2**224");
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        _moveVotingPower(delegates(from), delegates(to), amount);
    }
}
