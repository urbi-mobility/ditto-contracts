# Manual
Here we describe how to use the `Registry` smart contract, specifically:
- How to deploy the `Registry` smart contract.
- How to whitelist admins.
- Admins will then be able to whitelist Certification Authorities.
- Certification Authorities will be able to add proofs.

## Configure everything
In order to use Ethereum you need few things:
- An Ethereum account.
- A network to connect to.
- Some Ether to pay for the gas.

### Create an Ethereum Account
Install [MetaMask](https://metamask.io/) to create your account. If you are going to use the account for deploying things in production, make sure to **backup your passphrase**!

#### Alternatives
To create an Ethereum account you can use:
- for reasonable security:
  - Web tools: [MetaMask](https://metamask.io/), [MyCrypto](https://mycrypto.com/).
  - CLI tools: [Geth](https://geth.ethereum.org/), [Parity](https://www.parity.io/ethereum/).
- for maximum security: hardware wallets, for example [Ledger](https://www.ledger.com/) or [Trezor](https://trezor.io/).

### Connect to a network
There are different networks used for different reasons:
- Main Net for production.
- Rinkeby, Goerli, Ropsted for staging.
- Localhost for testing.

The simplest way to interact with Ethereum without setting up a full node is to use [infura](https://infura.io/). Register to get your API key.

#### Alternatives
You can run you own full node by running [Geth](https://geth.ethereum.org/) or [Parity](https://www.parity.io/ethereum/). This requires some extra effort, but it's the "decentralized way" to do things.

### Get Ether
In order to deploy smart contracts and interact with them you need ether to pay for the gas.
- For Main Net you can go to an exchange and buy it.
- For the other networks you can get ether from a faucet (see [Rinkeby Faucet](https://faucet.rinkeby.io/), [Ropsten Faucet](https://faucet.ropsten.be/), [Goerli Faucet](https://goerli-faucet.slock.it/)).
- For localhost, ether is usually provided by the test node.

### Put all together
Make sure you have Ether in your account. First export your account private key (MetaMask [has a guide](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key) on how to do it).

Create a file called `.env` with this content:

```
SECRET=<your private key>
INFURA_KEY=<your infura key>
```

This allows the CLI utility `truffle` to use the funds in your wallet to deploy the smart contract.

# Step 0: deploy the `Registry` Smart Contract
## Deploy the `Registry` smart contract
1. run `npm run deploy:staging` for staging, or `npm run deploy:production` for production.

# Step 1: whitelist an admin
After the smart contract has been deployed, the `owner` can whitelist `admins`. An `admin` is a super-role that can whitelist (add) new Certification Authorities.

```
npm run whitelist:admin:add <admin address>
```

# Step 2: whitelist a certification authority

```
npm run whitelist:ca:add <ca address>
```

```
npm run whitelist:ca:remove <ca address>
```
