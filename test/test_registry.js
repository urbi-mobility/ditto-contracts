const assert = require("assert");
const { keccak256 } = require("web3-utils");
const Registry = artifacts.require("Registry");

contract("Registry", async accounts => {
  // Simulate different actors.
  // - `admin`: the super organization that adds or removes certification
  // authorities.
  // - `caUrbi`: Urbi as a certification authority.
  // - `ca[1..n]`: other certification authorities.
  // - `alice`, `bob`: users of the service

  const [admin, caUrbi, ca1, ca2, alice, bob] = accounts;

  // `r` represents the registry smart contract, it is reassigned
  // before each test.
  let r;

  // Make sure we start each test with a freshly deployed smart contract.
  // We don't want tests to interfere between each others.
  beforeEach(async () => {
    r = await Registry.new();
  });

  it("when created has only one Whitelist Admin", async () => {
    // `admin` deployed the contract, and it must be a *whitelist admin*.
    assert.equal(await r.isWhitelistAdmin.call(admin), true);

    // `caUrbi` isn't an admin.
    assert.equal(await r.isWhitelistAdmin.call(caUrbi), false);
  });

  it("allows to add a Certification Authority", async () => {
    assert.equal(await r.isWhitelisted.call(caUrbi), false);
    await r.addWhitelisted(caUrbi, { from: admin });
    assert.equal(await r.isWhitelisted.call(caUrbi), true);
  });

  it("allows a CA to add a certification", async () => {
    await r.addWhitelisted(caUrbi, { from: admin });

    await r.addCertification(
      alice,
      keccak256("test data"),
      Math.round(new Date().getTime() / 1000).toString(),
      { from: caUrbi }
    );
  });

  it("a non-whitelisted CA cannot add certification", async () => {
    try {
      await r.addCertification(
        alice,
        keccak256("test data"),
        Math.round(new Date().getTime() / 1000).toString(),
        { from: ca1 }
      );
      assert.fail();
    } catch (e) {
      assert.equal(e.name, "StatusError");
    }
  });

  it.skip("allows a CA to revoke its own certification", async () => {});
});
