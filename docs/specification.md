# Specification
In this section we describe the scope of the project and the components of our proof of concept.

## Terminology
- **User**: A person who wants to use a car sharing service.
- **Personal Data**: Any piece of information that is private by nature, and belongs to a person.
- **Wallet**: A smartphone application to store, manage, and eventually share **Personal Data**.
- **Official Identity Registry**: a (governmental) entity that is able to validate user's **Personal Data**.
- **Certification Authority**: a trusted organization that verifies the authenticity of claims, signs them and generates verifiable claims.
- **Provider**: an entity that needs access to the user's **Personal Data** to offer a service (e.g. a car sharing provider).
- **Ledger**: a decentralized, permissionless database (e.g. the [Ethereum blockchain](https://ethereum.org/)).
- **Keypair**: a tuple `<private key, public key>` used to digitally sign and verify transactions and statements.

## Scope
To keep the project small and simple, we restricted the scope of the Personal Data that a user can share. Specifically, we deal with name, last name, date of birth, place of birth, address, phone number and, of course, **driving license data**. Moreover, for now users cannot selectively share a subset if their information.

Note that many open initiatives are currently working on similar problems. Some of the related initiatives and projects are:
- [Decentralized Identity Foundation](https://identity.foundation/)
- [DID Specification](https://w3c-ccg.github.io/did-spec/)
- [Verifiable Claims use cases](https://www.w3.org/TR/verifiable-claims-use-cases/)
- [W3C Verifiable Claims Working Group](https://www.w3.org/2017/vc/WG/)
- [Verifiable Claims use cases](https://www.w3.org/TR/verifiable-claims-use-cases/)
- [Verifiable Claims data model](https://www.w3.org/TR/verifiable-claims-data-model/)
- [Decentralized Key Management System](https://github.com/WebOfTrustInfo/rebooting-the-web-of-trust-spring2017/blob/master/topics-and-advance-readings/dkms-decentralized-key-mgmt-system.md)

If this proof of concept gets traction, we will embrace W3C standards.

For simplicity, we have only one Certification Authority. This constraint will be relaxed in the future.

## Proof of Concept
In our proof of concept we simulate the interactions between:
1. Alice and the Wallet, to go though the KYC process (this happens only once).
2. Alice and a car sharing Provider called BobCars, to reserve a car immediately, even if she is **not** yet a user of the service.

To demonstrate the proof of concept, we developed and open sourced multiple apps and services, specifically:
- The [Wallet](https://github.com/urbi-mobility/urbi-wallet), a proof of concept Ethereum wallet (built with React Native), that allows Alice to store and register her personal data. More in details it can:
  - Create a keypair.
  - Input Personal Data (driving license).
  - Upload to Certification Authority.
  - Store claims in local storage.
  - Manage authentication flow.
- The [Certification Authority Server](https://github.com/urbi-mobility/urbi-ca-server), that simulates the KYC process to validate the data that Alice inserts in the Wallet. It can:
  - Receive Personal Data.
  - Verify against an Official Identity Registry.
  - Hash Personal Data and sign the claim.
  - Store the claim in the Ledger.
- The [Provider App](https://github.com/urbi-mobility/provider-app), a mock app for a sharing mobility provider, namely BobCars. It can:
  - Activate the Wallet to register the user.
  - Get the data from the Wallet, and submit it to the Provider Server (specified below) to register the user.
- The Provider Server, that is the backend for the Provider App (BobCars). It can:
  - Expose an endpoint to receive the Personal Data from the Wallet app.
  - Verify data authenticity.
- The [Registry Smart Contract](https://github.com/urbi-mobility/contracts) to store the certification proofs. It can:
  - Manage a single Certification Authority (this is to simplify the project).
  - Store claims associated to a user.
  - Given a user, return the claim.


### Use case: registration
Alice wants to register her driving license. To do that, she installs the Wallet app, and inserts her personal data. When she is ready, she sends her data to the Certification Authority (CA). The Certification Authority contacts the Official Identity registry (OIR) to verify that the driving license data is correct. After that, the Certification Authority has a face to face call with Alice, to verify she is the actual person she claims to be. If the call is successful, the Certification Authority hashes the data that Alice provided, and makes a transaction to talk to the smart contract in the Ethereum Network. The smart contract contains now a signed claim of Alice's data.

![Registration Flow](./images/register.png)

### Use case: authorization
Alice wants to reserve a car with BobCars. She is not a user and she needs to register. She opens the BobCars app and she taps on *Sign up with your Wallet*. The Provider App (BobCars) opens the Wallet. The Wallet asks Alice if she really wants to share her information with BobCars. She agrees, and the Wallet shares the data with the BobCars app. BobCars app asks its backend to store Alice data and to sign her up. The backend checks if the Registry Smart Contract has a claim associated with Alice that is signed by a trusted Certification Authority. Since that's true, Alice is now signed in BobCars and she can immediately use the car.

![Authorization Flow](./images/authorize.png)

