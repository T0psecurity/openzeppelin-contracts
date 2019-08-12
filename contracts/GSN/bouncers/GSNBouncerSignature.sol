pragma solidity ^0.5.0;

import "./GSNBouncerBase.sol";
import "../../cryptography/ECDSA.sol";

contract GSNBouncerSignature is GSNBouncerBase {
    using ECDSA for bytes32;

    address private _trustedSigner;

    enum GSNBouncerSignatureErrorCodes {
        INVALID_SIGNER
    }

    constructor(address trustedSigner) public {
        _trustedSigner = trustedSigner;
    }

    function acceptRelayedCall(
        address relay,
        address from,
        bytes calldata encodedFunction,
        uint256 transactionFee,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 nonce,
        bytes calldata approvalData,
        uint256
    )
        external
        view
        returns (uint256, bytes memory)
    {
        bytes memory blob = abi.encodePacked(
            relay,
            from,
            encodedFunction,
            transactionFee,
            gasPrice,
            gasLimit,
            nonce, // Prevents replays on RelayHub
            getHubAddr(), // Prevents replays in multiple RelayHubs
            address(this) // Prevents replays in multiple recipients
        );
        if (keccak256(blob).toEthSignedMessageHash().recover(approvalData) == _trustedSigner) {
            return _approveRelayedCall();
        } else {
            return _rejectRelayedCall(uint256(GSNBouncerSignatureErrorCodes.INVALID_SIGNER));
        }
    }
}
