Disclaimer: this is an experiment, a proof of concept, and it's not intended to be used in production.

# Driving License wallet initiative

## Problem
Signing up for a car sharing service requires users to go through a KYC process. This process has to be repeated each time a user wants to sign up to a new, different service. Moreover, the KYC fee is often paid by users themselves. That's pretty dumb: as a user, why should I pay for KYC if I did it already? Why should I wait days to get access to the car sharing service? As a car sharing provider: KYC has a negative impact on the conversion rate, I'm losing money.

Right now, the flow is roughly the following:
- Alice is a potential user of BobCars.
- BobCars asks Alice to go through the KYC process using a third-party service.
- Alice goes through the KYC.
- BobCars stores the KYC result (certification) in its database.
- Alice can now use BobCars.

The result of the KYC is stored in BobCars database, and it's not accessible to anyone but BobCars.

## Solution
The idea is to allow users to store their information in their phones (in an so-called "wallet app"), and reveal all their information (or a subset) to the car sharing service. User's information includes: first name, last name, address, ..., and driving license data. This information is vetted and digitally signed by a Certification Authority, and stored in a decentralized database. The car sharing service can then verify the validity of the information by querying that decentralized database.

An example of decentralized database is the Ethereum blockchain.

### But... is it safe?
**Data stored in the blockchain is :100:% public. How can you preserve users' privacy while storing things in the public?**

Thanks for your question. The decentralized registry stores only the hash of the user's private information, and it's mathematically unfeasible to revert a hash.


# Technical details

## Registry contract
The `Registry.sol` contract maps an address (a "user id") to a certified proof.

# How does it work?
Check out the [example](./example/index.js) to see how the flow for registration and authentication works.

# How to run
Make sure to have truffle installed. You also need a development Ethereum node to test the contract and run the example. You can use `ganache-cli` or help me testing out [`ethnode`](https://github.com/vrde/ethnode).

```
npm i
truffle migrate
node example/index.js
```
