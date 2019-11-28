# Manual
Here we describe how to use the `Registry` smart contract, specifically:
- How to deploy the `Registry` smart contract.
- How to whitelist admins.
- Admins will then be able to whitelist Certification Authorities.
- Certification Authorities will be able to add proofs.

## About networks
As with other software projects, you'll be able to run things in a development environment, in a staging (test) network, and in a production network, specifically:
- **Development environment**: you run your own Ethereum node in your machine. The node creates **multiple different accouts** with a big amout of Eth (usually around 100 Eth) that you can use for testing. Deploying and calling smart contracts feels instant because there is no *Proof of Work* running in the background.
- **Staging network**: you connect to a test network managed by other people (you can be a validator too). There are many, the most famous ones are [Rinkeby](https://www.rinkeby.io/), Ropsten, [Görli](https://goerli.net/). Working on a test network is basically like working on the Main network, with the difference that Ether has no value, and security assumptions are weak. What's pretty cool is that you can deploy your smart contract there and then test it from all around the globe.
- **Production network**: The Main ethereum network, the one with a market cap.

Running on a development environment requires significally less effort. If you want to run on a staging or production network, keep reading.

## Connecting to a Staging or Production network
If you want to use a development node for testing, skip this section.

In order to use Ethereum you need few things:
- An Ethereum account.
- A network to connect to.
- Some Ether to pay for the gas.

### Create an Ethereum Account
Install [MetaMask](https://metamask.io/) to create your account. If you are going to use the account for deploying things in production, make sure to **backup your passphrase**! If you forget it or lose it, you'll lose your money, and there is no way back.

#### Alternatives
To create an Ethereum account you can use:
- for reasonable security:
  - Web tools: [MetaMask](https://metamask.io/), [MyCrypto](https://mycrypto.com/).
  - CLI tools: [Geth](https://geth.ethereum.org/), [Parity](https://www.parity.io/ethereum/).
- for maximum security: hardware wallets, for example [Ledger](https://www.ledger.com/) or [Trezor](https://trezor.io/).

### Select the network
There are different networks used for different reasons:
- Main Net for production.
- Rinkeby, Goerli, Ropsten for staging.
- (and, of course, you can connect to a development node for testing.)

The simplest way to interact with Ethereum without setting up a full node is to use [infura](https://infura.io/). Register to get your API key.

#### Alternatives
You can run you own full node by running [Geth](https://geth.ethereum.org/) or [Parity](https://www.parity.io/ethereum/). This requires some extra effort, but it's the "decentralized way" to do things.

### Get Ether
In order to deploy smart contracts and interact with them you need ether to pay for the gas.
- For Main Net you can go to an exchange and buy it.
- For the other networks you can get ether from a faucet (see [Rinkeby Faucet](https://faucet.rinkeby.io/), [Ropsten Faucet](https://faucet.ropsten.be/), [Goerli Faucet](https://goerli-faucet.slock.it/)).
- (For a development node, Ether is usually provided by the node itself.)

### Put all together
Make sure you have Ether in your account. First export your account private key (MetaMask [has a guide](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key) on how to do it).

Create a file called `.env` with this content:

```
SECRET=<your private key>
INFURA_KEY=<your infura key>
```

This allows the CLI utility `truffle` to use the funds in your wallet to deploy the smart contract.

# Use cases

## Deploy the Registry smart contract
### Deploy on a development node
Run [ethnode](https://github.com/vrde/ethnode/) or [ganache-cli](https://github.com/trufflesuite/ganache-cli) to start a development node.
Run `npm run deploy:development`.

### Deploy on a staging network
Run `npm run deploy:staging`.

### Deploy on a production network
Run `npm run deploy:production`.

## Whitelist new admins
After the smart contract has been deployed, the `owner` can whitelist `admins`. An `admin` is a super-role that can **whitelist** (add) new Certification Authorities.
```
node cli admin-add <admin address>
```

## Whitelist certification authority
`owner` and `admins` can add and remove certification authorities from the **whitelist** of the contract.

```
node cli authority-add <certification authority address>
```

```
node cli authority-remove <certification authority address>
```
