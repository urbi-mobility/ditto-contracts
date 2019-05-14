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
The App opens the Wallet by opening a deep link to:

```bash
urbiwallet://consent/<caller_readable_name>/<caller_callback_link>?challenge=<challenge>
```

where:
* `<caller_readable_name>` is the URI-encoded string that will be displayed to the user in order to get their approval. Example dialog (with `caller_readable_name` set to `"My%20App"`):

    > `My App` is requesting to read your personal data. Confirm letting `My App` read your data? \[Yes\] \[No\]
* `<caller_callback_link>` is the URI-encoded link that the Wallet will open to notify the App of the outcome of the access request (e.g., `myapp%3A%2F%2Fwallet-callback`). The App must therefore be configured to process these deep links. See [this guide for Android][1], and [this one for iOS][2] for more info
* `challenge` is a random string that the Wallet will sign using Alice's private key

An example link could thus be:

```
urbiwallet://consent/My%20App/myapp%3A%2F%2Fwallet-callback?challenge=439509230203971840
```

[1]: https://developer.android.com/training/app-links/deep-linking
[2]: https://developer.apple.com/documentation/uikit/core_app/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app

### Step 2: Wallet opens App to return response and data
The Wallet prompts Alice for confirmation, and opens the `<caller_callback_link>` from Step 1 to respond to the App. The Wallet adds a query string parameter called `consent` set to `true` or `false` according to whether Alice gave her consent. If `consent` is `true`, two additional string parameters are set:
* `response`, which is set to the result of signing the App's `challenge` with Alice's private key
* `payload` is set to the URI-encoded JSON representation of Alice's personal data

If Alice grants access to the App to her personal data, the Wallet therefore opens this deeplink in response to the example link from Step 1:

```
myapp://wallet-callback?consent=true&response=<challenge_response>&payload=<uri_encoded_json>
```

where:
* `<challenge_response>` is the signed `challenge`, e.g. `0x1d440704d79ab6428b5cce0c3c589aad8badc1da49027da6145565ac7018ca9d732ecffe528f4da508ec1e673d8f42c6738a83bed8c1f70cd26014575ba6ee331b`
* `<uri_encoded_json>` is the result of calling Javascript's `encodeURIComponent()` function on a JSON object that looks like this:

```json
{
  "address": "Via Tasso 11",
  "birthCountry": "Italy",
  "birthDate": "1950-01-22",
  "birthLocality": "Arenzano",
  "birthProvince": "MI",
  "city": "Milano",
  "country": "Italy",
  "dlExpirationDate": "2020-02-08",
  "dlIssuer": "Motorizzazione civile",
  "dlIssueDate": "2010-02-08",
  "dlLevels": {
    "A": true,
    "B1": true
  },
  "dlNumber": "AB123",
  "firstName": "Alice",
  "lastName": "Cipher",
  "nationality": "IT",
  "nonce": "982157432520684500",
  "phoneNumber": "003934712345678",
  "zip": "101010"
}
```

NOTE: the JSON above has been formatted for readability, the actual URI-encoded JSON contains no whitespaces, and would hence look like this instead:

```
%7B%22address%22%3A%22Via%20Tasso%2011%22%2C%22birthCountry%22%3A%22Italy%22%2C%22birthDate%22%3A%221950-01-22%22%2C%22birthLocality%22%3A%22Arenzano%22%2C%22birthProvince%22%3A%22MI%22%2C%22city%22%3A%22Milano%22%2C%22country%22%3A%22Italy%22%2C%22dlExpirationDate%22%3A%222020-02-08%22%2C%22dlIssuer%22%3A%22Motorizzazione%20civile%22%2C%22dlIssueDate%22%3A%222010-02-08%22%2C%22dlLevels%22%3A%7B%22A%22%3Atrue%2C%22B1%22%3Atrue%7D%2C%22dlNumber%22%3A%22AB123%22%2C%22firstName%22%3A%22Alice%22%2C%22lastName%22%3A%22Cipher%22%2C%22nationality%22%3A%22IT%22%2C%22nonce%22%3A%22982157432520684500%22%2C%22phoneNumber%22%3A%22003934712345678%22%2C%22zip%22%3A%22101010%22%7D
```

### Step 3: App sends data to the Backend
The App sends the data it received from the Wallet to its Backend. For example, it can send a POST request with a JSON body defined as such:

```json
{
  "challenge": "439509230203971840",
  "response": "0x1d440704d79ab6428b5cce0c3c589aad8badc1da49027da6145565ac7018ca9d732ecffe528f4da508ec1e673d8f42c6738a83bed8c1f70cd26014575ba6ee331b",
  "data": "{\"address\":\"Via Tasso 11\",\"birthCountry\":\"Italy\",\"birthDate\":\"1950-01-22\",\"birthLocality\":\"Arenzano\",\"birthProvince\":\"MI\",\"city\":\"Milano\",\"country\":\"Italy\",\"dlExpirationDate\":\"2020-02-08\",\"dlIssuer\":\"Motorizzazione civile\",\"dlIssueDate\":\"2010-02-08\",\"dlLevels\":{\"A\":true,\"B1\":true},\"dlNumber\":\"AB123\",\"firstName\":\"Alice\",\"lastName\":\"Cipher\",\"nationality\":\"IT\",\"nonce\":\"982157432520684500\",\"phoneNumber\":\"003934712345678\",\"zip\":\"101010\"}"
  }
}
```

Note that `data` contains the response from the Wallet after URI decoding (by using a function such as Javascript's `decodeURIComponent()`), but __without__ deserializing from JSON. That way, the Backend can verify the signature on the Blockchain by comparing the hash stored in the smart contract against the `data` field as-is. More on this in [the serialization section](#notes-on-json-serialization) further below.

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
const aliceDataProof = keccak256(appRequestToBackend.payload);
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


## Notes on JSON serialization
The certifications are stored in a smart contract. The smart contract maps a user to the certification data. A user is represented by an *Ethereum address*. Given a user, we can retrieve the data attached to it (if any). The certification data is a struct with the following fields:

```
address certifier;
bytes32 proof;
uint256 expirationDate;
```

`certifier` is the *Ethereum address* of the certification authority, `expirationDate` is the expiration date of the data.

`proof` is the **hash of the user's data**. To hash the data, BLOCK-ID uses a specific hashing function: `keccak256`. The input of a hashing function is bytes, so we need to serialize *data* to bytes. A simple serialization format is the utf8 encoded string of the json of the data (equivalent to the JavaScript function `JSON.stringify`).
Since *data* is a mapping itself, and mappings don't define the order of their elements. This means that given the same *data* mapping, we might end up with different utf8 encoded strings and hence different hashes. That's why we need to force the order of the items before serializing the *data*.

Given the `data` mapping, this is how to calculate its signature (or **proof**).

```js
const { keccak256 } = require("web3-utils");

function serialize(obj) {
  function sortAndClean(obj) {
    const keys = Object.keys(obj).sort();
    const sorted = {};
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = obj[key];
      if (value === null) {
        continue;
      }
      if (value.constructor === Object) {
        value = sortAndClean(value);
      }
      sorted[key] = value;
    }
    return sorted;
  }
  return JSON.stringify(sortAndClean(obj));
}

const data = {
  "address": "Via Tasso 11",
  "birthCountry": "Italy",
  "birthDate": "1950-01-22"
  /* ... */
};

const proof = keccak256(serialize(data));
```

Note that the Wallet returns a string representing the user's data to the Provider App. That string is **already sorted** in the way it should be, so the Backend can calculate the proof directly from that string.
