const { expectEvent } = require('openzeppelin-test-helpers');
const gsn = require('@openzeppelin/gsn-helpers');
const { fixSignature } = require('../helpers/sign');
const { utils: { toBN } } = require('web3');

const GSNBouncerSignatureMock = artifacts.require('GSNBouncerSignatureMock');

contract('GSNBouncerSignature', function ([_, signer, other]) {
  beforeEach(async function () {
    this.recipient = await GSNBouncerSignatureMock.new(signer);
  });

  context('when called directly', function () {
    it('mock function can be called', async function () {
      const { logs } = await this.recipient.mockFunction();
      expectEvent.inLogs(logs, 'MockFunctionCalled');
    });
  });

  context('when relay-called', function () {
    beforeEach(async function () {
      await gsn.fundRecipient(web3, { recipient: this.recipient.address });
    });

    it('rejects unsigned relay requests', async function () {
      await gsn.expectError(this.recipient.mockFunction({ value: 0, useGSN: true }));
    });

    it('rejects relay requests where some parameters are signed', async function () {
      const approveFunction = async (data) =>
        fixSignature(
          await web3.eth.sign(
            web3.utils.soliditySha3(
              // the nonce is not signed
              data.relayerAddress, data.from, data.encodedFunctionCall, data.txFee, data.gasPrice, data.gas
            ), signer
          )
        );

      await gsn.expectError(this.recipient.mockFunction({ value: 0, useGSN: true, approveFunction }));
    });

    it('accepts relay requests where all parameters are signed', async function () {
      const approveFunction = async (data) =>
        fixSignature(
          await web3.eth.sign(
            web3.utils.soliditySha3(
              // eslint-disable-next-line max-len
              data.relayerAddress, data.from, data.encodedFunctionCall, toBN(data.txFee), toBN(data.gasPrice), toBN(data.gas), toBN(data.nonce), data.relayHubAddress, data.to
            ), signer
          )
        );

      const { tx } = await this.recipient.mockFunction({ value: 0, useGSN: true, approveFunction });

      await expectEvent.inTransaction(tx, GSNBouncerSignatureMock, 'MockFunctionCalled');
    });

    it('rejects relay requests where all parameters are signed by an invalid signer', async function () {
      const approveFunction = async (data) =>
        fixSignature(
          await web3.eth.sign(
            web3.utils.soliditySha3(
              // eslint-disable-next-line max-len
              data.relay_address, data.from, data.encodedFunctionCall, data.txfee, data.gasPrice, data.gas, data.nonce, data.relayHubAddress, data.to
            ), other
          )
        );

      await gsn.expectError(this.recipient.mockFunction({ value: 0, useGSN: true, approveFunction }));
    });
  });
});
