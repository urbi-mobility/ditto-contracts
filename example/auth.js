const Web3 = require("web3");
const { keccak256 } = require("web3-utils");
const { register, serialize, stringTimestamp } = require("./utils");
const registryContract = require("../build/contracts/Registry.json");

const web3 = new Web3("http://localhost:8545/");

const aliceData = {
  nonce: "982157432520684500",
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
  phoneNumber: "003934712345678",
  dlNumber: "AB123",
  dlIssuer: "Motorizzazione civile",
  dlIssueDate: "2010-02-08",
  dlExpirationDate: "2020-02-08",
  dlLevels: {
    B1: true,
    A: true
  }
};

async function auth(alice, aliceData, urbi) {
  //
  // Step 2
  //
  console.log("Step 1: App sends challange to Wallet");
  const appRequestToWallet = {
    app: "Provider App",
    challenge: "439509230203971840"
  };
  console.log(JSON.stringify(appRequestToWallet, null, 2), "\n");

  //
  // Step 2
  //
  console.log("Step 2: App sends challange to Wallet");
  const walletResponseToApp = {
    response: await web3.eth.sign(appRequestToWallet.challenge, alice),
    data: aliceData
  };
  console.log(JSON.stringify(walletResponseToApp, null, 2), "\n");

  //
  // Step 3: App sends data to the Backend
  //
  console.log("Step 3: App sends data to the Backend");
  const appRequestToBackend = {
    challenge: appRequestToWallet.challenge,
    response: walletResponseToApp.response,
    data: walletResponseToApp.data
  };
  console.log(JSON.stringify(appRequestToBackend, null, 2), "\n");

  //
  // Step 4: Validate Alice's data
  //
  console.log("Step 4: Backend validates Alice's data");
  const aliceEthereumAddress = web3.eth.accounts.recover(
    appRequestToBackend.challenge,
    appRequestToBackend.response
  );
  const aliceDataProof = keccak256(serialize(aliceData));

  const contract = new web3.eth.Contract(
    registryContract.abi,
    registryContract.networks[await web3.eth.net.getId()].address
  );
  const certification = await contract.methods
    .certifications(aliceEthereumAddress)
    .call();

  if (
    certification.certifier === urbi &&
    certification.proof === aliceDataProof &&
    certification.expirationDate > stringTimestamp()
  ) {
    console.log("User is valid");
    console.log("Certifier:", certification.certifier);
    console.log("Proof:", certification.proof);
    console.log("Expiration:", certification.expirationDate);
  } else {
    throw new Error("User's data is not valid");
  }
}

async function main() {
  [urbi, alice] = await web3.eth.getAccounts();
  await register(web3, alice, aliceData, urbi);
  await auth(alice, aliceData, urbi);
}

main().catch(console.error);
