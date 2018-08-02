const { shouldBehaveLikeEscrow } = require('./Escrow.behaviour');

const Escrow = artifacts.require('Escrow');

contract('Escrow', function ([_, owner, ...otherAccounts]) {
  beforeEach(async function () {
    this.escrow = await Escrow.new({ from: owner });
  });

  shouldBehaveLikeEscrow(owner, otherAccounts);
});
