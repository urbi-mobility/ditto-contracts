const Web3 = require("web3");
const Web3Utils = require("web3-utils");
const web3 = new Web3("http://localhost:8545/");
const { serialize } = require("./utils");
const registryContract = require("../build/contracts/Registry.json");

console.log(`Example of a registration and authentication flow.
We have the following actors:
- BobCars: a new car sharing service
- Alice: she wants to use the new car sharing service called BobCars
- Urbi: a certification authority
`);

async function flow(alice, urbi) {
  console.log("*** Phase 1, registration ***");
  console.log(
    "Hello, I'm Alice. I want to verify my driving license using Urbi.",
    "Here is my data about my driving license:"
  );

  const aliceData = {
    nonce: "" + Math.ceil(Math.random() * 1e18),
    firstName: "Alice",
    lastName: "Cipher",
    nationality: "IT",
    birthDate: "1950-01-22",
    birthCountry: "Italy",
    birthProvince: "MI",
    birthLocality: "Arenzano",
    address: "Via Tasso 11",
    zip: "101010",
    city: "Milano",
    country: "Italy",
    phoneNumber: null,
    dlNumber: "AB123",
    dlIssuer: "Motorizzazione civile",
    dlIssueDate: "2010-02-08",
    dlExpirationDate: "2020-02-08",
    dlLevels: { B1: true, A: true }
  };

  console.log(aliceData);

  console.log(
    "I need to sign my data and send it to the Urbi API endpoint",
    "so they can validate it."
  );
  const aliceSignedData = {
    address: alice,
    signature: await web3.eth.sign(serialize(aliceData), alice),
    payload: aliceData
  };
  console.log("Here is my data, signed and ready to be sent to Urbi");
  console.log(aliceSignedData);

  console.log("\n\n");

  console.log(
    "Hello, I'm Urbi. I just got a request and I need to validate it."
  );
  const signerAddress = web3.eth.accounts.recover(
    serialize(aliceSignedData.payload),
    aliceSignedData.signature
  );

  console.log(
    "First thing is to recover the address that signed the message:",
    signerAddress
  );

  console.log(
    "Is it equal to the address embedded in the request?",
    aliceSignedData.address
  );

  if (signerAddress !== aliceSignedData.address) {
    console.log("Data is not valid");
    return;
  }

  console.log(
    "Here I'm asking to the Official Identity Registry",
    "if the driving license data is legit.",
    "I also check if Alice is a real person and will do some KYC with her.",
    "If everything is successful, I'll then proceed and register the",
    "hash of Alice's data in the blockchain"
  );
  const contract = new web3.eth.Contract(
    registryContract.abi,
    registryContract.networks[await web3.eth.net.getId()].address
  );
  const receipt = await contract.methods
    .addCertification(
      aliceSignedData.address,
      Web3Utils.keccak256(serialize(aliceSignedData.payload)),
      0
    )
    .send({ from: urbi });
  console.log(
    "I've successfully registered Alice's data in the Registry smart contract."
  );
  console.log(receipt);

  console.log("\n\n");
  console.log("*** Phase 2, authentication ***");
  console.log(
    "Hello here is BobCars, a new car sharing service. I see a new user wants",
    "to sign in! She claims her name is Alice, and that her driving license",
    "is legit, here is her full data:"
  );
  console.log(aliceData);
  console.log(
    "We need to make sure she owns the right address.",
    "Let's ask her to sign a nonce."
  );
  const challenge = "" + Math.ceil(Math.random() * 1e18);
  console.log("Here is the challenge to sign:", challenge);
  const response = await web3.eth.sign(challenge, alice);
  const challengedAddress = web3.eth.accounts.recover(challenge, response);
  console.log(
    "Given the response",
    response,
    "I can recover the address of the user",
    challengedAddress
  );
  console.log(
    "That's neat, let's see if we find data for that address",
    "Remember, we need to check that:",
    "\n- The certifier is Urbi:",
    urbi,
    "\n- The hash of the data is correct.",
    Web3Utils.keccak256(serialize(aliceData))
  );
  const certification = await contract.methods
    .certifications(challengedAddress)
    .call();
  console.log(certification);
}

async function main() {
  [urbi, alice] = await web3.eth.getAccounts();
  await flow(
    alice,
    urbi
  );
}

main().catch(console.error);
