import '../PullPaymentCapable.sol';

// UNSAFE CODE, DO NOT USE!

contract BadArrayUse is PullPaymentCapable {
  address[] employees;

  function payBonus() {
    for (var i = 0; i < employees.length; i++) {
			address employee = employees[i];
			uint bonus = calculateBonus(employee);
    	asyncSend(employee, bonus);
    }
  }

	function calculateBonus(address employee) returns (uint) {
    // some expensive computation...
  }

}
