const assert = require("assert");
const Registry = artifacts.require("Registry");

contract("Registry", async accounts => {
  // Simulate different actors.
  // - `admin`: the super organization that adds or removes certification
  // authorities.
  // - `caUrbi`: Urbi as a certification authority.
  // - `ca[1..n]`: other certification authorities.

  const [admin, caUrbi, ca1, ca2] = accounts;

  it("when created has only one Whitelist Admin", async () => {
    const r = await Registry.deployed();
    assert.equal(await r.isWhitelistAdmin.call(admin), true);
    assert.equal(await r.isWhitelistAdmin.call(caUrbi), false);
  });

  it("allows to add a Certification Authority", async () => {});

  it("allows a CA to add a certification", async () => {});

  it("allows a CA to revoke its own certification", async () => {});
});
