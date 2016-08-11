/*
 * Stoppable
 */
contract Stoppable {
  address public curator;
  bool public stopped;

  modifier stopInEmergency { if (!stopped) _ }
  modifier onlyInEmergency { if (stopped) _ }

  function Stoppable(address _curator) {
		if (_curator == 0) {
      throw;
    }
    curator = _curator;
  }

  function emergencyStop() external {
    if (msg.sender != curator) {
      throw;
    }
    stopped = true;
  }

}
