var MerkleProof = artifacts.require("./MerkleProof.sol");

import { sha3 } from "ethereumjs-util";
import MerkleTree from "./helpers/merkleTree.js";

contract('MerkleProof', function(accounts) {
  let merkleProof;

  before(async function() {
    merkleProof = await MerkleProof.new();
  });

  describe("verifyProof", function() {
    it("should return true for a valid Merkle proof", async function() {
      const elements = ["a", "b", "c", "d"].map(el => sha3(el));
      const merkleTree = new MerkleTree(elements);

      const root = merkleTree.getHexRoot();

      const proof = merkleTree.getHexProof(elements[0]);

      const leaf = merkleTree.bufToHex(elements[0]);

      const result = await merkleProof.verifyProof(proof, root, leaf);
      assert.isOk(result, "verifyProof did not return true for a valid proof");
    });

    it("should return false for an invalid Merkle proof", async function() {
      const elements = ["a", "b", "c"].map(el => sha3(el));
      const merkleTree = new MerkleTree(elements);

      const root = merkleTree.getHexRoot();

      const proof = merkleTree.getHexProof(elements[0]);
      const badProof = proof.slice(0, proof.length - 32);

      const leaf = merkleTree.bufToHex(elements[0]);

      const result = await merkleProof.verifyProof(badProof, root, leaf);
      assert.isNotOk(result, "verifyProof did not return false for an invalid proof");
    });
  });
});
