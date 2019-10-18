// # Tests for the Registry Smart Contract
// Where we test... the Registry Smart Contract!

const assert = require("assert");
const { keccak256 } = require("web3-utils");
const { now } = require("./utils");

// Import the registry artifact, this is handled by Truffle.
const Registry = artifacts.require("Registry");

contract("Registry", async accounts => {
  // Simulate different actors.
  // - `owner`: the super organization that adds or removes certification
  // authorities.
  // - `caUrbi`: Urbi as a certification authority.
  // - `ca[1..n]`: other certification authorities.
  // - `alice`, `bob`: users of the service
  const [owner, caUrbi, ca1, ca2, alice, bob] = accounts;

  // `r` represents the registry smart contract, it is reassigned
  // before each test.
  let r;

  // Make sure we start each test with a freshly deployed smart contract.
  // We don't want tests to interfere between each others.
  beforeEach(async () => {
    r = await Registry.new();
  });

  // ## Smart Contract initialization
  // We expect the smart contract to have only one whitelisted owner: the
  // deployer.
  it("when created has only one Whitelist Admin", async () => {
    // `owner` deployed the contract, and it must be a *whitelist owner*.
    assert.equal(await r.isWhitelistAdmin.call(owner), true);

    // The other actors should not be included in the whitelist, for example
    // `caUrbi` isn't an owner.
    assert.equal(await r.isWhitelistAdmin.call(caUrbi), false);
  });

  // ## Owner adds a Certification Authority
  it("allows to add a Certification Authority", async () => {
    // We want to add a new certification authority: `caUrbi`. First we make
    // sure it's **not** whitelisted.
    assert.equal(await r.isWhitelisted.call(caUrbi), false);

    // Then, as the owner of the contract, we add `caUrbi` to the list of
    // whitelisted certification authorities.
    await r.addWhitelisted(caUrbi, { from: owner });

    // And this should be enough to add it to the whitelist.
    assert.equal(await r.isWhitelisted.call(caUrbi), true);
  });

  // ## A Certification Authority adds a Certification
  it("allows a CA to add a certification", async () => {
    // Make sure `caUrbi` is a whitelisted certification authority.
    await r.addWhitelisted(caUrbi, { from: owner });

    // A certification needs an account.
    const account = alice;
    // It also contains the hash of the data (in this case we have
    // a dummy `test data`, that in a real world example will be the hash of
    // the alice's driver license.
    const proof = keccak256("test data");
    // And finally we add an expiration date as a timestamp.
    const expirationDate = now();

    // Now `caUrbi` adds a certification in the name of `alice`.
    await r.addCertification(account, proof, expirationDate, { from: caUrbi });

    // The contract will emit a `CertificationAdded` event, that is catched
    // here.
    const events = await r.getPastEvents("CertificationAdded", {
      fromBlock: 0,
      toBlock: "latest"
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].args.account, account);

    // And the certification should be stored in the smart contract.
    const cert = await r.certifications(account);
    assert.equal(cert.certifier, caUrbi);
    assert.equal(cert.proof, proof);
    assert.equal(cert.expirationDate.toNumber(), expirationDate);
  });

  // ## A Certification Authority removes a Certification
  it("allows a CA to remove a certification", async () => {
    await r.addWhitelisted(caUrbi, { from: owner });
    await r.addCertification(alice, keccak256("test data"), now(), {
      from: caUrbi
    });

    // Removing a certification takes only the address of the certified user.
    await r.removeCertification(alice, { from: caUrbi });

    // An event is emitted.
    const events = await r.getPastEvents("CertificationRemoved", {
      fromBlock: 0,
      toBlock: "latest"
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].args.account, alice);

    // And the mapping is cleared
    const cert = await r.certifications(alice);
    assert.equal(cert.certifier, "0x0000000000000000000000000000000000000000");
    assert.equal(
      cert.proof,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(cert.expirationDate.toNumber(), 0);
  });

  // ## A user can remove their Certification
  it("allows a user to remove their certification", async () => {
    await r.addWhitelisted(caUrbi, { from: owner });
    await r.addCertification(bob, keccak256("test data"), now(), {
      from: caUrbi
    });

    // Removing a certification takes only the address of the certified user.
    await r.removeCertification(bob, { from: bob });

    // An event is emitted.
    const events = await r.getPastEvents("CertificationRemoved", {
      fromBlock: 0,
      toBlock: "latest"
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].args.account, bob);

    // And the mapping is cleared
    const cert = await r.certifications(bob);
    assert.equal(cert.certifier, "0x0000000000000000000000000000000000000000");
    assert.equal(
      cert.proof,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(cert.expirationDate.toNumber(), 0);
  });

  // ## A Certification Authority cannot override an existing certification
  it("doesn't allow to override a certification", async () => {
    // Let's add a couple of CAs.
    await r.addWhitelisted(caUrbi, { from: owner });
    await r.addWhitelisted(ca1, { from: owner });

    const account = alice;
    const proof = keccak256("alice test data");
    const expirationDate = now();

    // `caUrbi` certifies `alice`'s data.
    await r.addCertification(alice, proof, expirationDate, {
      from: caUrbi
    });

    // Now `ca1` tries to override the data certified by `caUrbi`.
    try {
      await r.addCertification(alice, keccak256("alice fake data"), now(), {
        from: ca1
      });
      assert.fail();
    } catch (e) {
      assert.equal(e.name, "StatusError");
    }

    // The certification should be the same as before.
    const cert = await r.certifications(account);
    assert.equal(cert.certifier, caUrbi);
    assert.equal(cert.proof, proof);
    assert.equal(cert.expirationDate.toNumber(), expirationDate);
  });

  // ## A random address cannot add a certification
  // Just to make sure no-one but CAs can add certifications, we simulate the
  // scenario of a random address trying to add a certification by calling the
  // `addCertification` method. This operation will result in a reverted
  // transaction.
  it("a non-whitelisted address cannot add certification", async () => {
    try {
      await r.addCertification(alice, keccak256("test data"), now(), {
        from: ca1
      });
      assert.fail();
    } catch (e) {
      assert.equal(e.name, "StatusError");
    }
  });

  // ## Try different scenarios
  it("works just fine", async () => {
    // The owner adds caUrbi, ca1, and ca2 to the whitelisted roles.
    await r.addWhitelisted(caUrbi, { from: owner });
    await r.addWhitelisted(ca1, { from: owner });
    await r.addWhitelisted(ca2, { from: owner });

    // `ca1` certifies `bob`
    await r.addCertification(bob, keccak256("bob test data"), now(), {
      from: ca1
    });

    // `ca2` certifies `alice`
    await r.addCertification(alice, keccak256("alice test data"), now(), {
      from: ca2
    });

    // `alice` removes her certification.
    await r.removeCertification(alice, { from: alice });

    // `caUrbi` certifies `alice`
    await r.addCertification(alice, keccak256("alice test data"), now(), {
      from: caUrbi
    });

    // And this should be the final state.
    assert.equal((await r.certifications(alice)).certifier, caUrbi);
    assert.equal((await r.certifications(bob)).certifier, ca1);
  });
});
