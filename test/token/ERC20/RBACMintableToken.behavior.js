const { expectThrow } = require('../../helpers/expectThrow');

const ROLE_MINTER = 'minter';

function shouldBehaveLikeRBACMintableToken (owner, [anyone]) {
  describe('handle roles', function () {
    it('owner can add and remove a minter role', async function () {
      await this.token.addMinter(anyone, { from: owner });
      let hasRole = await this.token.hasRole(anyone, ROLE_MINTER);
      assert.equal(hasRole, true);

      await this.token.removeMinter(anyone, { from: owner });
      hasRole = await this.token.hasRole(anyone, ROLE_MINTER);
      assert.equal(hasRole, false);
    });

    it('anyone can\'t add or remove a minter role', async function () {
      await expectThrow(
        this.token.addMinter(anyone, { from: anyone })
      );

      await this.token.addMinter(anyone, { from: owner });
      await expectThrow(
        this.token.removeMinter(anyone, { from: anyone })
      );
    });
  });
}

module.exports = {
  shouldBehaveLikeRBACMintableToken,
};
