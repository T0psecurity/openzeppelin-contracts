const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const ERC721MinterPauser = contract.fromArtifact('ERC721MinterPauser');

describe('ERC721MinterPauser', function () {
  const [ deployer, other ] = accounts;

  const name = 'MinterPauserToken';
  const symbol = 'DRT';

  const tokenId = new BN('1337');

  const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const MINTER_ROLE = web3.utils.soliditySha3('MINTER_ROLE');
  const PAUSER_ROLE = web3.utils.soliditySha3('PAUSER_ROLE');

  beforeEach(async function () {
    this.token = await ERC721MinterPauser.new(name, symbol, { from: deployer });
  });

  it('deployer has the default admin role', async function () {
    expect(await this.token.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.bignumber.equal('1');
    expect(await this.token.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(deployer);
  });

  it('deployer has the minter role', async function () {
    expect(await this.token.getRoleMemberCount(MINTER_ROLE)).to.be.bignumber.equal('1');
    expect(await this.token.getRoleMember(MINTER_ROLE, 0)).to.equal(deployer);
  });

  it('deployer has the pauser role', async function () {
    expect(await this.token.getRoleMemberCount(PAUSER_ROLE)).to.be.bignumber.equal('1');
    expect(await this.token.getRoleMember(PAUSER_ROLE, 0)).to.equal(deployer);
  });

  it('minter and pauser role admin is the default admin', async function () {
    expect(await this.token.getRoleAdmin(MINTER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
    expect(await this.token.getRoleAdmin(PAUSER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
  });

  describe('minting', function () {
    it('deployer can mint tokens', async function () {
      const receipt = await this.token.mint(other, tokenId, { from: deployer });
      expectEvent(receipt, 'Transfer', { from: ZERO_ADDRESS, to: other, tokenId });

      expect(await this.token.balanceOf(other)).to.be.bignumber.equal('1');
      expect(await this.token.ownerOf(tokenId)).to.equal(other);
    });

    it('other accounts cannot mint tokens', async function () {
      await expectRevert(
        this.token.mint(other, tokenId, { from: other }),
        'ERC721MinterPauser: must have minter role to mint'
      );
    });
  });

  describe('pausing', function () {
    it('deployer can pause', async function () {
      const receipt = await this.token.pause({ from: deployer });
      expectEvent(receipt, 'Paused', { account: deployer });

      expect(await this.token.paused()).to.equal(true);
    });

    it('deployer can unpause', async function () {
      await this.token.pause({ from: deployer });

      const receipt = await this.token.unpause({ from: deployer });
      expectEvent(receipt, 'Unpaused', { account: deployer });

      expect(await this.token.paused()).to.equal(false);
    });

    it('cannot mint while paused', async function () {
      await this.token.pause({ from: deployer });

      await expectRevert(
        this.token.mint(other, tokenId, { from: deployer }),
        'ERC721Pausable: token transfer while paused'
      );
    });

    it('other accounts cannot pause', async function () {
      await expectRevert(this.token.pause({ from: other }), 'ERC721MinterPauser: must have pauser role to pause');
    });
  });

  describe('burning', function () {
    it('holders can burn their tokens', async function () {
      await this.token.mint(other, tokenId, { from: deployer });

      const receipt = await this.token.burn(tokenId, { from: other });

      expectEvent(receipt, 'Transfer', { from: other, to: ZERO_ADDRESS, tokenId });

      expect(await this.token.balanceOf(other)).to.be.bignumber.equal('0');
      expect(await this.token.totalSupply()).to.be.bignumber.equal('0');
    });
  });
});
