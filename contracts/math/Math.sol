pragma solidity ^0.4.24;


/**
 * @title Math
 * @dev Assorted math operations
 */
library Math {
  function max(uint256 _a, uint256 _b) internal pure returns (uint256) {
    return _a >= _b ? _a : _b;
  }

  function min(uint256 _a, uint256 _b) internal pure returns (uint256) {
    return _a < _b ? _a : _b;
  }

  function average(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // (_a + _b) / 2 can overflow, so we distribute
    return (_a / 2) + (_b / 2) + ((_a % 2 + _b % 2) / 2);
  }
}
