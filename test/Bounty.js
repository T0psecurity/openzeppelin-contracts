contract('Bounty', function(accounts) {
  it("can call checkInvariant for InsecureTargetMock", function(done){
    var bounty = Bounty.deployed();
    var target = SecureTargetMock.deployed();
    bounty.createTarget(target.address).
      then(function() {
        return bounty.checkInvariant.call()
      }).
      then(function(result) {
        assert.isTrue(result);
      }).
      then(done);
  })

  it("can call checkInvariant for InsecureTargetMock", function(done){
    var bounty = Bounty.deployed();
    var target = InsecureTargetMock.deployed();
    bounty.createTarget(target.address).
      then(function() {
        return bounty.checkInvariant.call()
      }).
      then(function(result) {
        assert.isFalse(result);
      }).
      then(done);
  })
});
