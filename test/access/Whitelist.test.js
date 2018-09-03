const { expectThrow } = require('../helpers/expectThrow');

const WhitelistMock = artifacts.require('WhitelistMock');

require('chai')
  .should();

contract('Whitelist', function ([_, owner, whitelistedAddress1, whitelistedAddress2, anyone]) {
  const whitelistedAddresses = [whitelistedAddress1, whitelistedAddress2];

  beforeEach(async function () {
    this.mock = await WhitelistMock.new({ from: owner });
  });

  context('in normal conditions', function () {
    it('should add address to the whitelist', async function () {
      await this.mock.addAddressToWhitelist(whitelistedAddress1, { from: owner });
      (await this.mock.isWhitelisted(whitelistedAddress1)).should.equal(true);
    });

    it('should add addresses to the whitelist', async function () {
      await this.mock.addAddressesToWhitelist(whitelistedAddresses, { from: owner });
      for (const addr of whitelistedAddresses) {
        (await this.mock.isWhitelisted(addr)).should.equal(true);
      }
    });

    it('should remove address from the whitelist', async function () {
      await this.mock.removeAddressFromWhitelist(whitelistedAddress1, { from: owner });
      (await this.mock.isWhitelisted(whitelistedAddress1)).should.equal(false);
    });

    it('should remove addresses from the the whitelist', async function () {
      await this.mock.removeAddressesFromWhitelist(whitelistedAddresses, { from: owner });
      for (const addr of whitelistedAddresses) {
        (await this.mock.isWhitelisted(addr)).should.equal(false);
      }
    });

    it('should allow whitelisted address to call #onlyWhitelistedCanDoThis', async function () {
      await this.mock.addAddressToWhitelist(whitelistedAddress1, { from: owner });
      await this.mock.onlyWhitelistedCanDoThis({ from: whitelistedAddress1 });
    });
  });

  context('in adversarial conditions', function () {
    it('should not allow "anyone" to add to the whitelist', async function () {
      await expectThrow(
        this.mock.addAddressToWhitelist(whitelistedAddress1, { from: anyone })
      );
    });

    it('should not allow "anyone" to remove from the whitelist', async function () {
      await expectThrow(
        this.mock.removeAddressFromWhitelist(whitelistedAddress1, { from: anyone })
      );
    });

    it('should not allow "anyone" to call #onlyWhitelistedCanDoThis', async function () {
      await expectThrow(
        this.mock.onlyWhitelistedCanDoThis({ from: anyone })
      );
    });
  });
});
