# Integration Overview
Welcome to the Integration Overview. This document gives you an overview on how to integrate the BLOCK-ID authentication protocol from the perspective of a shared mobility provider.

The *Authentication Flow* has examples of the data exchanged between the different parties involved, and some examples of the logic (in JavaScript).

A running example is available in [example/auth.js](./example/auth.js).

## Terminology
Here we define the actors and applications involved in the authentication flow:
- *Wallet*: A smartphone application to store, manage, and eventually share a digital driving license..
- *Alice*: a user with the Wallet installed in her smartphone.
- *Provider*: a mobility provider.
- *App*: the mobile application to use the mobility services offered by the *Provider*.
- *Backend*: the backend infrastructure of the *Provider*.

## Authentication Flow
This section explains the authentication flow from the Provider perspective. Roughly speaking, the flow is the following:
- Alice wants to sign in to *Provider*, she opens *App* and taps on **Login with BLOCK-ID**.
- The *App* opens the *Wallet*.
- (*Alice* confirms to share data the external provider)
- The *Wallet* re-opens the *App*, sharing a `json` containing the personal data of Alice.
- The *App* sends the data to the *Backend* for validation and storage of the data. If the data is valid, then *Alice* is signed up and ready to use the services of *Provider*.


### Step 1: App opens Wallet and sends challenge
Intent, send challenge. Challenge is a random string Alice needs to sign to prove it's actually her.
```json
{
  "app": "Provider App",
  "challenge": "439509230203971840"
}
```


### Step 2: Wallet opens App to return response and data
Wallet sends JSON to App.

```json
{
  "response": "0x1d440704d79ab6428b5cce0c3c589aad8badc1da49027da6145565ac7018ca9d732ecffe528f4da508ec1e673d8f42c6738a83bed8c1f70cd26014575ba6ee331b",
  "data": {
    "nonce": "982157432520684500",
    "firstName": "Alice",
    "lastName": "Cipher",
    "nationality": "IT",
    "birthDate": "1950-01-22",
    "birthCountry": "Italy",
    "birthProvince": "MI",
    "birthLocality": "Arenzano",
    "address": "Via Tasso 11",
    "zip": "101010",
    "city": "Milano",
    "country": "Italy",
    "phoneNumber": "003934712345678",
    "dlNumber": "AB123",
    "dlIssuer": "Motorizzazione civile",
    "dlIssueDate": "2010-02-08",
    "dlExpirationDate": "2020-02-08",
    "dlLevels": {
      "B1": true,
      "A": true
    }
  }
}
```

### Step 3: App sends data to the Backend


```json
{
  "challenge": "439509230203971840",
  "response": "0x1d440704d79ab6428b5cce0c3c589aad8badc1da49027da6145565ac7018ca9d732ecffe528f4da508ec1e673d8f42c6738a83bed8c1f70cd26014575ba6ee331b",
  "data": {
    "nonce": "982157432520684500",
    "firstName": "Alice",
    "lastName": "Cipher",
    "nationality": "IT",
    "birthDate": "1950-01-22",
    "birthCountry": "Italy",
    "birthProvince": "MI",
    "birthLocality": "Arenzano",
    "address": "Via Tasso 11",
    "zip": "101010",
    "city": "Milano",
    "country": "Italy",
    "phoneNumber": "003934712345678",
    "dlNumber": "AB123",
    "dlIssuer": "Motorizzazione civile",
    "dlIssueDate": "2010-02-08",
    "dlExpirationDate": "2020-02-08",
    "dlLevels": {
      "B1": true,
      "A": true
    }
  }
}
```

### Step 4: The Backend validates the data using the smart contract
The Backend has now all the data needed to validate Alice's request.

First, it uses the *challenge-response* to extract Alice's Ethereum address.
```js
const aliceEthereumAddress = web3.eth.accounts.recover(
  appRequestToBackend.challenge,
  appRequestToBackend.response
);
```

Then it calculates the *hash* of the data.
```js
const aliceDataProof = keccak256(serialize(aliceData));
```

Then, it loads the smart contract interface.
```js
const contract = new web3.eth.Contract(
  registryContract.abi,
  registryContract.networks[await web3.eth.net.getId()].address
);
```

Then, it asks the smart contract to retrieve the certification attached to Alice's Ethereum address.
```js
const certification = await contract.methods
  .certifications(aliceEthereumAddress)
  .call();
```

Finally, it checks that the certification:
- comes from a known, trusted certifier, in this case *Urbi*
- stores the exact same *hash* of the data Alice gave us
- expires in the future.

```js
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
```

If all conditions are true, then the data that Alice shared with us is valid and certified. The Backend can return an affirmative answer to the App.
