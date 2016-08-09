/*
 * Killable
 * Base contract that can be killed by owner
 */
contract Killable is Ownable {
  function kill() {
    if (msg.sender == owner) suicide(owner);
  }
}
