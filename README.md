[![Build Status](https://travis-ci.org/urbi-mobility/contracts.svg?branch=master)](https://travis-ci.org/urbi-mobility/contracts)

# Driving License wallet initiative
TL;DR: rent cars by using your digital driving license.

## Table of Contents
- [Introduction](#problem)
- [Specification](./docs/specification.md)
- [Why Blockchain](./docs/why-blockchain.md)
- [Integration](./docs/integration.md)
- [Data Flow](./docs/data-flow.md)

## Problem
Signing up for a car sharing service requires users to go through a [Know Your Customer](https://en.wikipedia.org/wiki/Know_your_customer) (KYC) process. This process has to be repeated each time a user wants to sign up to a new, different service. Moreover, the KYC fee is often paid by users themselves. That's pretty frustrating: as a user, why should I pay for KYC if I did it already? Why should I wait days to get access to the car sharing service? As a car sharing provider: KYC has a negative impact on the conversion rate, I'm losing money.

Right now, the flow is roughly the following:
- Alice is a potential user of BobCars.
- BobCars asks Alice to go through the KYC process using a third-party service.
- Alice goes through the KYC.
- BobCars stores the KYC result (certification) in its database.
- Alice can now use BobCars.

The result of the KYC is stored in BobCars database, and it's not accessible to anyone but BobCars. If Alice wants to use another car sharing provider, she has to go through (and pay) the KYC process again.

## Solution
The idea is to allow users to go through KYC only once, by reusing multiple times their certified data. Roughly speaking, users store their information in their phones (in an so-called "wallet app"), and reveal all their information (or a subset) to the car sharing service. User's information includes: first name, last name, address, ..., and driving license data. This information is vetted and digitally signed by a Certification Authority, and stored in a decentralized database. The car sharing service can then verify the validity of the information by querying that decentralized database. An example of decentralized database is the Ethereum blockchain.

## This is a protocol, not a product (but we have a reference implementation).
The intent of this project is to define a **protocol** that any car sharing provider might integrate in their services. Our initiative might develop tools to use as a **reference implementation** of the protocol, as well as a **reference wallet** to store user's personal data.

It's on the providers' hands to use the reference implementation of the protocol or develop its own.

It's on the users' hands to download and use the **reference wallet** or develop new wallets.

Think about this as the `http` protocol. The protocol is free and open, you don't have to pay to use `http`. There are several browsers that can talk `http`, some free-open source, some other closed source. There are multiple implementations of web servers, some free-open source, some closed source.

# Run the code!

## Registry contract
The `Registry.sol` contract maps an address (a "user id") to a certified proof.

# How does it work?
Check out the [example](./example/index.js) to see how the flow for registration and authentication works.

# How to run
Make sure to have truffle installed. You also need a development Ethereum node to test the contract and run the example. You can use `ganache-cli` or [`ethnode`](https://github.com/vrde/ethnode).

```
npm i
truffle migrate
node example/index.js
```
