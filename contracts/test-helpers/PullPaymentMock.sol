pragma solidity ^0.4.0;
import '../PullPayment.sol';

// mock class using PullPayment
contract PullPaymentMock is PullPayment {
  // test helper function to call asyncSend
  function callSend(address dest, uint amount) external {
    asyncSend(dest, amount);
  }
}
