module.exports = function(deployer) {
  deployer.deploy(PullPaymentBid);
  deployer.deploy(BadArrayUse);
  deployer.deploy(Bounty);
  deployer.deploy(Ownable);
  deployer.deploy(LimitFunds);
};
