const { shouldFail, constants } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const RolesMock = artifacts.require('RolesMock');

contract('Roles', function ([_, authorized, otherAuthorized, other]) {
  beforeEach(async function () {
    this.roles = await RolesMock.new();
  });

  it('reverts when querying roles for the zero account', async function () {
    await shouldFail.reverting(this.roles.has(ZERO_ADDRESS));
  });

  context('initially', function () {
    it('doesn\'t pre-assign roles', async function () {
      (await this.roles.has(authorized)).should.equal(false);
      (await this.roles.has(otherAuthorized)).should.equal(false);
      (await this.roles.has(other)).should.equal(false);
    });

    describe('adding roles', function () {
      it('adds roles to a single account', async function () {
        await this.roles.add(authorized);
        (await this.roles.has(authorized)).should.equal(true);
        (await this.roles.has(other)).should.equal(false);
      });

      it('reverts when adding roles to an already assigned account', async function () {
        await this.roles.add(authorized);
        await shouldFail.reverting(this.roles.add(authorized));
      });

      it('reverts when adding roles to the zero account', async function () {
        await shouldFail.reverting(this.roles.add(ZERO_ADDRESS));
      });
    });
  });

  context('with added roles', function () {
    beforeEach(async function () {
      await this.roles.add(authorized);
      await this.roles.add(otherAuthorized);
    });

    describe('removing roles', function () {
      it('removes a single role', async function () {
        await this.roles.remove(authorized);
        (await this.roles.has(authorized)).should.equal(false);
        (await this.roles.has(otherAuthorized)).should.equal(true);
      });

      it('reverts when removing unassigned roles', async function () {
        await shouldFail.reverting(this.roles.remove(other));
      });

      it('reverts when removing roles from the zero account', async function () {
        await shouldFail.reverting(this.roles.remove(ZERO_ADDRESS));
      });
    });
  });
});
