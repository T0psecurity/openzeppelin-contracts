contract('Bounty', function(accounts) {
  it("can create bounty contract with factory address", function(done){
    var target = SecureTargetMock.deployed();
    SimpleTokenBounty.new(target.address).
      then(function(bounty){
        return bounty.factoryAddress.call()
      }).
      then(function(address){
        assert.equal(address, target.address)
      }).
      then(done);
  })

  it("can call checkInvariant for SecureTargetMock", function(done){
    var bounty;
    var targetFactory = SecureTargetFactory.deployed();
    SimpleTokenBounty.new(targetFactory.address).
      then(function(_bounty) {
        bounty = _bounty;
        return bounty.createTarget();
      }).
      then(function() {
        return bounty.checkInvariant.call()
      }).
      then(function(result) {
        assert.isTrue(result);
      }).
      then(done);
  })

  it("can call checkInvariant for InsecureTargetMock", function(done){
    var bounty;
    var targetFactory = InsecureTargetFactory.deployed();
    SimpleTokenBounty.new(targetFactory.address).
      then(function(_bounty) {
        bounty = _bounty;
        return bounty.createTarget();
      }).
      then(function() {
        return bounty.checkInvariant.call()
      }).
      then(function(result) {
        assert.isFalse(result);
      }).
      then(done);
  })
});
