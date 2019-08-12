pragma solidity ^0.5.0;

import "./GSNBouncerBase.sol";
import "../../math/SafeMath.sol";
import "../../ownership/Secondary.sol";
import "../../token/ERC20/SafeERC20.sol";
import "../../token/ERC20/ERC20.sol";
import "../../token/ERC20/ERC20Detailed.sol";

contract GSNBouncerERC20Fee is GSNBouncerBase {
    using SafeERC20 for __unstable__ERC20PrimaryAdmin;
    using SafeMath for uint256;

    enum GSNBouncerERC20FeeErrorCodes {
        INSUFFICIENT_BALANCE
    }

    __unstable__ERC20PrimaryAdmin private _token;

    constructor(string memory name, string memory symbol, uint8 decimals) public {
        _token = new __unstable__ERC20PrimaryAdmin(name, symbol, decimals);
    }

    function token() public view returns (IERC20) {
        return IERC20(_token);
    }

    function _mint(address account, uint256 amount) internal {
        _token.mint(account, amount);
    }

    function acceptRelayedCall(
        address,
        address from,
        bytes calldata,
        uint256 transactionFee,
        uint256 gasPrice,
        uint256,
        uint256,
        bytes calldata,
        uint256 maxPossibleCharge
    )
        external
        view
        returns (uint256, bytes memory)
    {
        if (_token.balanceOf(from) < maxPossibleCharge) {
            return _rejectRelayedCall(uint256(GSNBouncerERC20FeeErrorCodes.INSUFFICIENT_BALANCE));
        }

        return _approveRelayedCall(abi.encode(from, maxPossibleCharge, transactionFee, gasPrice));
    }

    function _preRelayedCall(bytes memory context) internal returns (bytes32) {
        (address from, uint256 maxPossibleCharge) = abi.decode(context, (address, uint256));

        // The maximum token charge is pre-charged from the user
        _token.safeTransferFrom(from, address(this), maxPossibleCharge);
    }

    function _postRelayedCall(bytes memory context, bool, uint256 actualCharge, bytes32) internal {
        (address from, uint256 maxPossibleCharge, uint256 transactionFee, uint256 gasPrice) =
            abi.decode(context, (address, uint256, uint256, uint256));

        // actualCharge is an _estimated_ charge, which assumes postRelayedCall will use all available gas.
        // This implementation's gas cost can be roughly estimated as 10k gas, for the two SSTORE operations in an
        // ERC20 transfer.
        uint256 overestimation = _computeCharge(POST_RELAYED_CALL_MAX_GAS.sub(10000), gasPrice, transactionFee);
        actualCharge = actualCharge.sub(overestimation);

        // After the relayed call has been executed and the actual charge estimated, the excess pre-charge is returned
        _token.safeTransfer(from, maxPossibleCharge.sub(actualCharge));
    }
}

/**
 * @title __unstable__ERC20PrimaryAdmin
 * @dev An ERC20 token owned by another contract, which has minting permissions and can use transferFrom to receive
 * anyone's tokens. This contract is an internal helper for GSNRecipientERC20Fee, and should not be used
 * outside of this context.
 */
// solhint-disable-next-line contract-name-camelcase
contract __unstable__ERC20PrimaryAdmin is ERC20, ERC20Detailed, Secondary {
    uint256 private constant UINT256_MAX = 2**256 - 1;

    constructor(string memory name, string memory symbol, uint8 decimals) public ERC20Detailed(name, symbol, decimals) {
        // solhint-disable-previous-line no-empty-blocks
    }

    // The primary account (GSNRecipientERC20Fee) can mint tokens
    function mint(address account, uint256 amount) public onlyPrimary {
        _mint(account, amount);
    }

    // The primary account has 'infinite' allowance for all token holders
    function allowance(address owner, address spender) public view returns (uint256) {
        if (spender == primary()) {
            return UINT256_MAX;
        } else {
            return super.allowance(owner, spender);
        }
    }

    // Allowance for the primary account cannot be changed (it is always 'infinite')
    function _approve(address owner, address spender, uint256 value) internal {
        if (spender == primary()) {
            return;
        } else {
            super._approve(owner, spender, value);
        }
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        if (recipient == primary()) {
            _transfer(sender, recipient, amount);
            return true;
        } else {
            return super.transferFrom(sender, recipient, amount);
        }
    }
}
