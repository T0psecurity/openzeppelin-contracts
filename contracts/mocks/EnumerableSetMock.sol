pragma solidity ^0.5.0;

import "../utils/EnumerableSet.sol";

contract EnumerableSetMock{
    using EnumerableSet for EnumerableSet.AddressSet;

    event TransactionResult(bool result);

    EnumerableSet.AddressSet private set;

    constructor() public {
        set = EnumerableSet.newAddressSet();
    }

    function contains(address value) public view returns (bool) {
        return set.contains(value);
    }

    function add(address value) public {
        bool result = set.add(value);
        emit TransactionResult(result);
    }

    function remove(address value) public {
        bool result = set.remove(value);
        emit TransactionResult(result);
    }

    function enumerate() public view returns (address[] memory) {
        return set.enumerate();
    }
}
