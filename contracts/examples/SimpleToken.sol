pragma solidity ^0.4.11;


import "../token/StandardToken.sol";


/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator. 
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 */
contract SimpleToken is StandardToken {

  string public constant name = "SimpleToken";
  string public constant symbol = "SIM";
  uint256 public constant decimals = 18;

  uint256 public constant INITIAL_SUPPLY = 10000;

  /**
   * @dev Contructor that gives msg.sender all of existing tokens. 
   */
  function SimpleToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

}
