pragma solidity ^0.4.0;

/*
 * Ownable
 * Base contract with an owner
 */
contract Ownable {
  address public owner;

  function Ownable() {
    owner = msg.sender;
  }

  modifier onlyOwner() { 
    if (msg.sender == owner)
      _;
  }

  function transfer(address newOwner) onlyOwner {
    owner = newOwner;
  }

}
