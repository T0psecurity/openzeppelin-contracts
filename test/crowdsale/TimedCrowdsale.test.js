const { BN, ether, expectEvent, shouldFail, time } = require('openzeppelin-test-helpers');

const TimedCrowdsaleImpl = artifacts.require('TimedCrowdsaleImpl');
const SimpleToken = artifacts.require('SimpleToken');

contract('TimedCrowdsale', function ([_, investor, wallet, purchaser]) {
  const rate = new BN(1);
  const value = ether('42');
  const tokenSupply = new BN('10').pow(new BN('22'));

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await time.advanceBlock();
  });

  beforeEach(async function () {
    this.openingTime = (await time.latest()).add(time.duration.weeks(1));
    this.closingTime = this.openingTime.add(time.duration.weeks(1));
    this.afterClosingTime = this.closingTime.add(time.duration.seconds(1));
    this.token = await SimpleToken.new();
  });

  it('reverts if the opening time is in the past', async function () {
    await shouldFail.reverting(TimedCrowdsaleImpl.new(
      (await time.latest()).sub(time.duration.days(1)), this.closingTime, rate, wallet, this.token.address
    ));
  });

  it('reverts if the closing time is before the opening time', async function () {
    await shouldFail.reverting(TimedCrowdsaleImpl.new(
      this.openingTime, this.openingTime.sub(time.duration.seconds(1)), rate, wallet, this.token.address
    ));
  });

  it('reverts if the closing time equals the opening time', async function () {
    await shouldFail.reverting(TimedCrowdsaleImpl.new(
      this.openingTime, this.openingTime, rate, wallet, this.token.address
    ));
  });

  context('with crowdsale', function () {
    beforeEach(async function () {
      this.crowdsale = await TimedCrowdsaleImpl.new(
        this.openingTime, this.closingTime, rate, wallet, this.token.address
      );
      await this.token.transfer(this.crowdsale.address, tokenSupply);
    });

    it('should be ended only after end', async function () {
      (await this.crowdsale.hasClosed()).should.equal(false);
      await time.increaseTo(this.afterClosingTime);
      (await this.crowdsale.isOpen()).should.equal(false);
      (await this.crowdsale.hasClosed()).should.equal(true);
    });

    describe('accepting payments', function () {
      it('should reject payments before start', async function () {
        (await this.crowdsale.isOpen()).should.equal(false);
        await shouldFail.reverting(this.crowdsale.send(value));
        await shouldFail.reverting(this.crowdsale.buyTokens(investor, { from: purchaser, value: value }));
      });

      it('should accept payments after start', async function () {
        await time.increaseTo(this.openingTime);
        (await this.crowdsale.isOpen()).should.equal(true);
        await this.crowdsale.send(value);
        await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      });

      it('should reject payments after end', async function () {
        await time.increaseTo(this.afterClosingTime);
        await shouldFail.reverting(this.crowdsale.send(value));
        await shouldFail.reverting(this.crowdsale.buyTokens(investor, { value: value, from: purchaser }));
      });
    });

    describe('extending closing time', function () {
      it('should not reduce duration', async function () {
        // Same date
        await shouldFail.reverting(this.crowdsale.extendTime(this.closingTime));

        // Prescending date
        const newClosingTime = this.closingTime.sub(time.duration.seconds(1));
        await shouldFail.reverting(this.crowdsale.extendTime(newClosingTime));
      });

      context('before crowdsale start', function () {
        beforeEach(async function () {
          (await this.crowdsale.isOpen()).should.equal(false);
          await shouldFail.reverting(this.crowdsale.send(value));
        });

        it('it extends end time', async function () {
          const newClosingTime = this.closingTime.add(time.duration.days(1));
          const { logs } = await this.crowdsale.extendTime(newClosingTime);
          expectEvent.inLogs(logs, 'TimedCrowdsaleExtended', {
            prevClosingTime: this.closingTime,
            newClosingTime: newClosingTime,
          });
          (await this.crowdsale.closingTime()).should.be.bignumber.equal(newClosingTime);
        });
      });

      context('after crowdsale start', function () {
        beforeEach(async function () {
          await time.increaseTo(this.openingTime);
          (await this.crowdsale.isOpen()).should.equal(true);
          await this.crowdsale.send(value);
        });

        it('it extends end time', async function () {
          const newClosingTime = this.closingTime.add(time.duration.days(1));
          const { logs } = await this.crowdsale.extendTime(newClosingTime);
          expectEvent.inLogs(logs, 'TimedCrowdsaleExtended', {
            prevClosingTime: this.closingTime,
            newClosingTime: newClosingTime,
          });
          (await this.crowdsale.closingTime()).should.be.bignumber.equal(newClosingTime);
        });
      });

      context('after crowdsale end', function () {
        beforeEach(async function () {
          await time.increaseTo(this.afterClosingTime);
        });

        it('it reverts', async function () {
          const newClosingTime = await time.latest();
          await shouldFail.reverting(this.crowdsale.extendTime(newClosingTime));
        });
      });
    });
  });
});
