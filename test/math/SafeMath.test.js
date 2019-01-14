const { BN, constants, shouldFail } = require('openzeppelin-test-helpers');
const { MAX_UINT256 } = constants;

const SafeMathMock = artifacts.require('SafeMathMock');

contract('SafeMath', function () {
  beforeEach(async function () {
    this.safeMath = await SafeMathMock.new();
  });

  describe('add', function () {
    it('adds correctly', async function () {
      const a = new BN('5678');
      const b = new BN('1234');

      (await this.safeMath.add(a, b)).should.be.bignumber.equal(a.add(b));
    });

    it('reverts on addition overflow', async function () {
      const a = MAX_UINT256;
      const b = new BN('1');

      await shouldFail.reverting(this.safeMath.add(a, b));
    });
  });

  describe('sub', function () {
    it('subtracts correctly', async function () {
      const a = new BN('5678');
      const b = new BN('1234');

      (await this.safeMath.sub(a, b)).should.be.bignumber.equal(a.sub(b));
    });

    it('reverts if subtraction result would be negative', async function () {
      const a = new BN('1234');
      const b = new BN('5678');

      await shouldFail.reverting(this.safeMath.sub(a, b));
    });
  });

  describe('mul', function () {
    it('multiplies correctly', async function () {
      const a = new BN('1234');
      const b = new BN('5678');

      (await this.safeMath.mul(a, b)).should.be.bignumber.equal(a.mul(b));
    });

    it('handles a zero product correctly (first number as zero)', async function () {
      const a = new BN('0');
      const b = new BN('5678');

      (await this.safeMath.mul(a, b)).should.be.bignumber.equal(a.mul(b));
    });

    it('handles a zero product correctly (second number as zero)', async function () {
      const a = new BN('5678');
      const b = new BN('0');

      (await this.safeMath.mul(a, b)).should.be.bignumber.equal(a.mul(b));
    });

    it('reverts on multiplication overflow', async function () {
      const a = MAX_UINT256;
      const b = new BN('2');

      await shouldFail.reverting(this.safeMath.mul(a, b));
    });
  });

  describe('div', function () {
    it('divides correctly', async function () {
      const a = new BN('5678');
      const b = new BN('5678');

      (await this.safeMath.div(a, b)).should.be.bignumber.equal(a.div(b));
    });

    it('divides zero correctly', async function () {
      const a = new BN('0');
      const b = new BN('5678');

      (await this.safeMath.div(a, b)).should.be.bignumber.equal('0');
    });

    it('returns complete number result on non-even division', async function () {
      const a = new BN('7000');
      const b = new BN('5678');

      (await this.safeMath.div(a, b)).should.be.bignumber.equal('1');
    });

    it('reverts on zero division', async function () {
      const a = new BN('5678');
      const b = new BN('0');

      await shouldFail.reverting(this.safeMath.div(a, b));
    });
  });

  describe('mod', function () {
    describe('modulos correctly', async function () {
      it('when the dividend is smaller than the divisor', async function () {
        const a = new BN('284');
        const b = new BN('5678');

        (await this.safeMath.mod(a, b)).should.be.bignumber.equal(a.mod(b));
      });

      it('when the dividend is equal to the divisor', async function () {
        const a = new BN('5678');
        const b = new BN('5678');

        (await this.safeMath.mod(a, b)).should.be.bignumber.equal(a.mod(b));
      });

      it('when the dividend is larger than the divisor', async function () {
        const a = new BN('7000');
        const b = new BN('5678');

        (await this.safeMath.mod(a, b)).should.be.bignumber.equal(a.mod(b));
      });

      it('when the dividend is a multiple of the divisor', async function () {
        const a = new BN('17034'); // 17034 == 5678 * 3
        const b = new BN('5678');

        (await this.safeMath.mod(a, b)).should.be.bignumber.equal(a.mod(b));
      });
    });

    it('reverts with a 0 divisor', async function () {
      const a = new BN('5678');
      const b = new BN('0');

      await shouldFail.reverting(this.safeMath.mod(a, b));
    });
  });
});
