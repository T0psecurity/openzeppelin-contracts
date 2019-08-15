pragma solidity ^0.5.0;

import "./ContextMock.sol";
import "../GSN/GSNContext.sol";
import "../GSN/IRelayRecipient.sol";

// By inheriting from GSNContext, Context's internal functions are overridden automatically
contract GSNContextMock is ContextMock, GSNContext, IRelayRecipient {
    function getHubAddr() public view returns (address) {
        return _relayHub;
    }

    function acceptRelayedCall(
        address,
        address,
        bytes calldata,
        uint256,
        uint256,
        uint256,
        uint256,
        bytes calldata,
        uint256
    )
        external
        view
        returns (uint256, bytes memory)
    {
        return (0, "");
    }

    function preRelayedCall(bytes calldata) external returns (bytes32) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function postRelayedCall(bytes calldata, bool, uint256, bytes32) external {
        // solhint-disable-previous-line no-empty-blocks
    }

    function getRelayHub() public view returns (address) {
        return _relayHub;
    }

    function upgradeRelayHub(address newRelayHub) public {
        return _upgradeRelayHub(newRelayHub);
    }
}
