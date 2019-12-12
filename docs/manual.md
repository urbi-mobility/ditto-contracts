# Manual

Here we describe how to use the `Registry` smart contract, specifically:

- How to deploy the `Registry` smart contract.
- How to whitelist admins.
- Admins will then be able to whitelist Certification Authorities.
- Certification Authorities will be able to add proofs.

## Understanding Ethereum networks

As with other software projects, you'll be able to run things in a development environment, in a staging (test) network, and in a production network, specifically:

- **Development environment**: you run your own Ethereum node in your machine. The node creates **multiple different accouts** with a big amout of Eth (usually around 100 Eth) that you can use for testing. Deploying and calling smart contracts feels instant because there is no _Proof of Work_ running in the background.
- **Staging network**: you connect to a test network managed by other people (you can be a validator too). There are many, the most famous ones are [Rinkeby](https://www.rinkeby.io/), Ropsten, [Görli](https://goerli.net/). Working on a test network is basically like working on the Main network, with the difference that Ether has no value, and security assumptions are weak. What's pretty cool is that you can deploy your smart contract there and then test it from all around the globe.
- **Production network**: The Main ethereum network, the one with a market cap.

Running on a development environment requires significally less effort. If you want to run on a staging or production network, keep reading.

## Setup

### Connecting to a Staging or Production network

_If you want to use a development node for testing, you can skip this section._

In order to use Ethereum you need few things:

- An Ethereum account.
- A network to connect to.
- Some Ether to pay for the gas.

#### Create an Ethereum Account

Install [MetaMask](https://metamask.io/) to create your account. If you are going to use the account for deploying things in production, make sure to **backup your passphrase**! If you forget it or lose it, you'll lose your money, and there is no way back.

##### About multi-signature wallets

While managing the smart contract from a single account is a viable option, a better approach would be to use a multi-signature (also called *multisig*) wallet to operate it.

A multisig wallet is nothing more that another smart contract owned by multiple addresses. The multisig wallet stores transactions that are executed once at least `n` owner signatures (out of `m` total owners) has been collected. The multisig can hold funds and call other smart contracts, and it can be the owner of other contracts.

Using a multisig wallet has many benefits, such as:

- Better security: the attacker needs to compromise `n` keys in order to control the smart contract.
- More safety: up to `m - n` private keys can be lost without losing the smart contract forever.
- Lower error rate: an action is vetted by `n` participants, so responsibility is distributed amongst all owners.
- Multi paradigm: multisig wallets can easily model a hierarchy of a company or of an organization, or voting systems.

There are many implementations of multisig wallets. A simple and secure one is the [Gnosis multisig wallet](https://wallet.gnosis.pm/).

##### Other ways to create an Ethereum Account

To create an Ethereum account you can also use:

- for reasonable security:
  - Web tools: [MetaMask](https://metamask.io/), [MyCrypto](https://mycrypto.com/).
  - CLI tools: [Geth](https://geth.ethereum.org/), [Parity](https://www.parity.io/ethereum/).
- for maximum security: hardware wallets, for example [Ledger](https://www.ledger.com/) or [Trezor](https://trezor.io/).

#### Select the network

There are different networks used for different reasons:

- Main Net for production.
- Rinkeby, Goerli, Ropsten for staging.
- (and, of course, you can connect to a development node for testing.)

The simplest way to interact with Ethereum without setting up a full node is to use [infura](https://infura.io/). Register to get your API key.

##### Preferred way to connect to a network

Using **infura** is quite easy, but doesn't play well with decentralization. The preferred way to connect to Ethereum is to run your own node.

You can run you own full node by running [Geth](https://geth.ethereum.org/) or [Parity](https://www.parity.io/ethereum/). This requires some extra effort, but it's the "decentralized way" to do things.

#### Get Ether

In order to deploy smart contracts and interact with them you need ether to pay for the gas.

- For Main Net you can go to an exchange and buy it.
- For the other networks you can get ether from a faucet (see [Rinkeby Faucet](https://faucet.rinkeby.io/), [Ropsten Faucet](https://faucet.ropsten.be/), [Goerli Faucet](https://goerli-faucet.slock.it/)).
- (For a development node, Ether is usually provided by the node itself.)

#### Put all together

Make sure you have Ether in your account. First export your account private key (MetaMask [has a guide](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key) on how to do it).

Create a file called `.env` with this content:

```
SECRET=<your private key>
INFURA_KEY=<your infura key>
```

This allows the CLI utility `truffle` to use the funds in your wallet to deploy the smart contract.

## Usage

This section enumerates all possible use cases for the Registry smart contract. A smart contract can be called in many different ways, here we show how to use it from the custom command line interface and programmatically. In both cases make sure to have all dependencies correctly installed by running `npm install`.

### Deploy the Registry smart contract

The `Registry` smart contract is ready to be deployed as it is. Once the smart contract is **mined** (i.e. included in a block) it is ready to be used.

Note that the deployment will generate a new file or update the existing one in `/build/contracts/Registry.json`. This file contains two important information:

- The **ABI** (abstract binary interface) of the contract, a JSON containing all data about attributes, methods, and signatures exposed to the end user.
- The **addresses** of the smart contracts deployed. Note that a single smart contract can be deployed on different networks, and the address will differ on each network.

Make sure to keep the `Registry.json` file once you deploy the smart contact. If you lose it well, don't worry much, you can recreate it.

The smart contract has a role-based access control system that allows only selected accounts to do certain actions (for more information you can check the documentation about [access control](https://docs.openzeppelin.com/contracts/2.x/access-control) in the OpenZeppelin website).

The roles are:

- **owner**: the administrator of the contract. By default, the owner role is assigned to the account that created the smart contract. It can be changed later. The owner is also responsible to add or remove admins.
- **admin**: an account that enables or disables Certification Autorities.
- **certification authority**: an account that can add or remove certifications.
- **user**: an account that has a certification in the system. The user owns their certification, and they can remove it if they want.

#### Deploy on a development node

Run [ethnode](https://github.com/vrde/ethnode/) or [ganache-cli](https://github.com/trufflesuite/ganache-cli) to start a development node.

You are now ready to deploy the contracts to your development network:

```bash
npm run deploy:development
```

#### Deploy on a staging network

Make sure you have test Ether in your account, then run:

```bash
npm run deploy:staging
```

#### Deploy on a production network

Make sure you have Ether in your account, then run:

```bash
npm run deploy:production
```

### Manage the admins whitelist

After the smart contract has been deployed, the `owner` can whitelist `admins`. An `admin` is a super-role that modify the **whitelist** for Certification Authorities.

```bash
node cli admin-add <admin address>
```

### Use the Registry smart contract programmatically

### Manage the certification authorities whitelist

`owner` and `admins` can add and remove certification authorities from the **whitelist** of the contract.

```bash
node cli authority-add <certification authority address>
```

```bash
node cli authority-remove <certification authority address>
```

### Certify a user as a certification authority

Compared to the previous commands, adding a certificate is a more complex operation that requires writing some code. For more information check the simple example [registration.js](../example/register.js).

### Verify a certification

This operation requires writing some code as well. The process in coded and described in the second part of [registration.js](../example/register.js).

### Get notified when a certificate is added or removed

Every time a new certification is added to or removed from the registry, the Smart Contract fires an event. Many Ethereum libraries allow to listen to those events, e.g. the library Web3.js exposes [an interface](https://web3js.readthedocs.io/en/v1.2.4/web3-eth-contract.html) to catch events and react to them. It's up to the providers to implement their logic to update their database.

### About data flow, GDPR, and privacy

We have an extensive document on how data is mnaged in the [Data Flow for the Authentication Protocol](./data-flow.md).
