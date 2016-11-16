contract('DelayedClaimable', function(accounts) {
  var delayedClaimable;

  beforeEach(function() {
    return DelayedClaimable.new().then(function(deployed) {
      delayedClaimable = deployed;
    });
  });

  it("changes pendingOwner after transfer succesful", function(done) {
    var newOwner = accounts[2];
    return delayedClaimable.transfer(newOwner)
      .then(function(){
        return delayedClaimable.setDelay(1000)
      })
      .then(function(){
        return delayedClaimable.claimBefore();
      })
      .then(function(claimBefore) {
        assert.isTrue(claimBefore == 1000);
        return delayedClaimable.pendingOwner();
      })
      .then(function(pendingOwner) {
        assert.isTrue(pendingOwner === newOwner);
        delayedClaimable.claimOwnership({from: newOwner});
        return delayedClaimable.owner();
      })
      .then(function(owner) {
        assert.isTrue(owner === newOwner);
      })
      .then(done)
  });

  it("changes pendingOwner after transfer fails", function(done) {
    var newOwner = accounts[1];
    return delayedClaimable.transfer(newOwner)
      .then(function(){
        return delayedClaimable.setDelay(1)
      })
      .then(function(){
        return delayedClaimable.claimBefore();
      })
      .then(function(claimBefore) {
        assert.isTrue(claimBefore == 1);
        return delayedClaimable.pendingOwner();
      })
      .then(function(pendingOwner) {
        assert.isTrue(pendingOwner === newOwner);
        // delayedClaimable.claimOwnership({from: newOwner}); Uncomment to break the test.
        return delayedClaimable.owner();
      })
      .then(function(owner) {
        assert.isTrue(owner != newOwner);
      })
      .then(done)
  });

});
