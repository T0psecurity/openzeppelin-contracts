pragma solidity ^0.4.24;


import "../cryptography/ECDSA.sol";


contract ECDSAMock {
  using ECDSA for bytes32;

  function recover(bytes32 _hash, bytes _signature)
    public
    pure
    returns (address)
  {
    return _hash.recover(_signature);
  }

  function toEthSignedMessageHash(bytes32 _hash)
    public
    pure
    returns (bytes32)
  {
    return _hash.toEthSignedMessageHash();
  }
}
