const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

function shouldBehaveLikeERC20Mintable (minter, [other]) {
  describe('as a mintable token', function () {
    describe('mint', function () {
      const amount = new BN(100);

      context('when the sender has minting permission', function () {
        const from = minter;

        context('for a zero amount', function () {
          shouldMint(new BN(0));
        });

        context('for a non-zero amount', function () {
          shouldMint(amount);
        });

        function shouldMint (amount) {
          beforeEach(async function () {
            ({ logs: this.logs } = await this.token.mint(other, amount, { from }));
          });

          it('mints the requested amount', async function () {
            (await this.token.balanceOf(other)).should.be.bignumber.equal(amount);
          });

          it('emits a mint and a transfer event', async function () {
            expectEvent.inLogs(this.logs, 'Transfer', {
              from: ZERO_ADDRESS,
              to: other,
              value: amount,
            });
          });
        }
      });

      context('when the sender doesn\'t have minting permission', function () {
        const from = other;

        it('reverts', async function () {
          await shouldFail.reverting(this.token.mint(other, amount, { from }));
        });
      });
    });
  });
}

module.exports = {
  shouldBehaveLikeERC20Mintable,
};
