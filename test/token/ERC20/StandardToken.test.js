const { assertRevert } = require('../../helpers/assertRevert');
const expectEvent = require('../../helpers/expectEvent');

const StandardToken = artifacts.require('StandardTokenMock');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('StandardToken', function ([_, owner, recipient, anotherAccount]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  beforeEach(async function () {
    this.token = await StandardToken.new(owner, 100);
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      const totalSupply = await this.token.totalSupply();

      totalSupply.should.be.bignumber.equal(100);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        const balance = await this.token.balanceOf(anotherAccount);

        balance.should.be.bignumber.equal(0);
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        const balance = await this.token.balanceOf(owner);

        balance.should.be.bignumber.equal(100);
      });
    });
  });

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient;

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('reverts', async function () {
          await assertRevert(this.token.transfer(to, amount, { from: owner }));
        });
      });

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('transfers the requested amount', async function () {
          await this.token.transfer(to, amount, { from: owner });

          const senderBalance = await this.token.balanceOf(owner);
          senderBalance.should.be.bignumber.equal(0);

          const recipientBalance = await this.token.balanceOf(to);
          recipientBalance.should.be.bignumber.equal(amount);
        });

        it('emits a transfer event', async function () {
          const { logs } = await this.token.transfer(to, amount, { from: owner });

          const event = expectEvent.inLogs(logs, 'Transfer', {
            from: owner,
            to: to,
          });

          event.args.value.should.be.bignumber.equal(amount);
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;

      it('reverts', async function () {
        await assertRevert(this.token.transfer(to, 100, { from: owner }));
      });
    });
  });

  describe('approve', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(amount);
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(amount);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(amount);
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(amount);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const amount = 100;
      const spender = ZERO_ADDRESS;

      it('approves the requested amount', async function () {
        await this.token.approve(spender, amount, { from: owner });

        const allowance = await this.token.allowance(owner, spender);
        allowance.should.be.bignumber.equal(amount);
      });

      it('emits an approval event', async function () {
        const { logs } = await this.token.approve(spender, amount, { from: owner });

        logs.length.should.eq(1);
        logs[0].event.should.eq('Approval');
        logs[0].args.owner.should.eq(owner);
        logs[0].args.spender.should.eq(spender);
        logs[0].args.value.should.be.bignumber.equal(amount);
      });
    });
  });

  describe('transfer from', function () {
    const spender = recipient;

    describe('when the recipient is not the zero address', function () {
      const to = anotherAccount;

      describe('when the spender has enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, 100, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('transfers the requested amount', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender });

            const senderBalance = await this.token.balanceOf(owner);
            senderBalance.should.be.bignumber.equal(0);

            const recipientBalance = await this.token.balanceOf(to);
            recipientBalance.should.be.bignumber.equal(amount);
          });

          it('decreases the spender allowance', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(0);
          });

          it('emits a transfer event', async function () {
            const { logs } = await this.token.transferFrom(owner, to, amount, { from: spender });

            logs.length.should.eq(1);
            logs[0].event.should.eq('Transfer');
            logs[0].args.from.should.eq(owner);
            logs[0].args.to.should.eq(to);
            logs[0].args.value.should.be.bignumber.equal(amount);
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
          });
        });
      });

      describe('when the spender does not have enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, 99, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
          });
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const amount = 100;
      const to = ZERO_ADDRESS;

      beforeEach(async function () {
        await this.token.approve(spender, amount, { from: owner });
      });

      it('reverts', async function () {
        await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
      });
    });
  });

  describe('decrease approval', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('emits an approval event', async function () {
          const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(0);
        });

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(0);
          });
        });

        describe('when the spender had an approved amount', function () {
          const approvedAmount = amount;

          beforeEach(async function () {
            await this.token.approve(spender, approvedAmount, { from: owner });
          });

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseApproval(spender, approvedAmount - 5, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(5);
          });

          it('sets the allowance to zero when all allowance is removed', async function () {
            await this.token.decreaseApproval(spender, approvedAmount, { from: owner });
            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(0);
          });

          it('sets the allowance to zero when more than the full allowance is removed', async function () {
            await this.token.decreaseApproval(spender, approvedAmount + 5, { from: owner });
            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(0);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(0);
        });

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(0);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, amount + 1, { from: owner });
          });

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(1);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const amount = 100;
      const spender = ZERO_ADDRESS;

      it('decreases the requested amount', async function () {
        await this.token.decreaseApproval(spender, amount, { from: owner });

        const allowance = await this.token.allowance(owner, spender);
        allowance.should.be.bignumber.equal(0);
      });

      it('emits an approval event', async function () {
        const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner });

        logs.length.should.eq(1);
        logs[0].event.should.eq('Approval');
        logs[0].args.owner.should.eq(owner);
        logs[0].args.spender.should.eq(spender);
        logs[0].args.value.should.be.bignumber.equal(0);
      });
    });
  });

  describe('increase approval', function () {
    const amount = 100;

    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(amount);
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(amount + 1);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(amount);
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            allowance.should.be.bignumber.equal(amount + 1);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS;

      it('approves the requested amount', async function () {
        await this.token.increaseApproval(spender, amount, { from: owner });

        const allowance = await this.token.allowance(owner, spender);
        allowance.should.be.bignumber.equal(amount);
      });

      it('emits an approval event', async function () {
        const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

        logs.length.should.eq(1);
        logs[0].event.should.eq('Approval');
        logs[0].args.owner.should.eq(owner);
        logs[0].args.spender.should.eq(spender);
        logs[0].args.value.should.be.bignumber.equal(amount);
      });
    });
  });

  describe('_mint', function () {
    const initialSupply = new BigNumber(100);
    const amount = new BigNumber(50);

    it('rejects a null account', async function () {
      await assertRevert(this.token.mint(ZERO_ADDRESS, amount));
    });

    describe('for a non null account', function () {
      beforeEach('minting', async function () {
        const { logs } = await this.token.mint(recipient, amount);
        this.logs = logs;
      });

      it('increments totalSupply', async function () {
        const expectedSupply = initialSupply.plus(amount);
        (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
      });

      it('increments recipient balance', async function () {
        (await this.token.balanceOf(recipient)).should.be.bignumber.equal(amount);
      });

      it('emits Transfer event', async function () {
        const event = expectEvent.inLogs(this.logs, 'Transfer', {
          from: ZERO_ADDRESS,
          to: recipient,
        });

        event.args.value.should.be.bignumber.equal(amount);
      });
    });
  });

  describe('_burn', function () {
    const initialSupply = new BigNumber(100);
    const amount = new BigNumber(50);

    it('rejects a null account', async function () {
      await assertRevert(this.token.burn(ZERO_ADDRESS, amount));
    });

    describe('for a non null account', function () {
      it('rejects burning more than balance', async function () {
        await assertRevert(this.token.burn(owner, initialSupply.plus(1)));
      });

      describe('for less amount than balance', function () {
        beforeEach('burning', async function () {
          const { logs } = await this.token.burn(owner, amount);
          this.logs = logs;
        });

        it('decrements totalSupply', async function () {
          const expectedSupply = initialSupply.minus(amount);
          (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
        });

        it('decrements owner balance', async function () {
          const expectedBalance = initialSupply.minus(amount);
          (await this.token.balanceOf(owner)).should.be.bignumber.equal(expectedBalance);
        });

        it('emits Transfer event', async function () {
          const event = expectEvent.inLogs(this.logs, 'Transfer', {
            from: owner,
            to: ZERO_ADDRESS,
          });

          event.args.value.should.be.bignumber.equal(amount);
        });
      });
    });
  });

  describe('_burnFrom', function () {
    const initialSupply = new BigNumber(100);
    const allowance = new BigNumber(70);
    const amount = new BigNumber(50);

    const spender = anotherAccount;

    beforeEach('approving', async function () {
      await this.token.approve(spender, allowance, { from: owner });
    });

    it('rejects a null account', async function () {
      await assertRevert(this.token.burnFrom(ZERO_ADDRESS, amount));
    });

    describe('for a non null account', function () {
      it('rejects burning more than allowance', async function () {
        await assertRevert(this.token.burnFrom(owner, allowance.plus(1)));
      });

      it('rejects burning more than balance', async function () {
        await assertRevert(this.token.burnFrom(owner, initialSupply.plus(1)));
      });

      describe('for less amount than allowance', function () {
        beforeEach('burning', async function () {
          const { logs } = await this.token.burnFrom(owner, amount, { from: spender });
          this.logs = logs;
        });

        it('decrements totalSupply', async function () {
          const expectedSupply = initialSupply.minus(amount);
          (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
        });

        it('decrements owner balance', async function () {
          const expectedBalance = initialSupply.minus(amount);
          (await this.token.balanceOf(owner)).should.be.bignumber.equal(expectedBalance);
        });

        it('decrements spender allowance', async function () {
          const expectedAllowance = allowance.minus(amount);
          (await this.token.allowance(owner, spender)).should.be.bignumber.equal(expectedAllowance);
        });

        it('emits Transfer event', async function () {
          const event = expectEvent.inLogs(this.logs, 'Transfer', {
            from: owner,
            to: ZERO_ADDRESS,
          });

          event.args.value.should.be.bignumber.equal(amount);
        });
      });
    });
  });
});
