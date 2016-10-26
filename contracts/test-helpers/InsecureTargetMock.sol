pragma solidity ^0.4.0;

contract InsecureTargetMock {
  function checkInvariant() returns(bool){
    return false;
  }
}

contract InsecureTargetFactory {
  function deployContract() returns (address) {
    return new InsecureTargetMock();
  }
}
