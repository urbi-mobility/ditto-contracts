const readline = require("readline");

// https://ethereum.stackexchange.com/a/17101/33448
const NETWORK_ID_TO_NAME = {
  //  0: {name: "Olympic", description: "Ethereum public pre-release PoW testnet"},
  1: {
    name: "homestead",
    description: "Homestead, Metropolis, the Ethereum public PoW main network"
  },
  2: {
    name: "morden",
    description: "the public Ethereum Classic PoW testnet"
  },
  3: {
    name: "ropsten",
    description: "the public cross-client Ethereum PoW testnet"
  },
  4: {name: "rinkeby", description: "the public Geth-only PoA testnet"},
  5: {name: "goerli", description: "the public cross-client PoA testnet"},
  6: {
    name: "kotti",
    description: "the public cross-client PoA testnet for Classic"
  },
  8: {
    name: "ubiq",
    description: "the public Gubiq main network with flux difficulty"
  },
  42: {name: "kovan", description: "the public Parity-only PoA testnet"},
  60: {name: "gochain", description: "the GoChain networks mainnet"},
  77: {name: "sokol", description: "the public POA Network testnet"},
  99: {name: "core", description: "the public POA Network main network"},
  100: {
    name: "xdai",
    description: "the public MakerDAO/POA Network main network"
  },
  31337: {
    name: "gochain",
    description: "the GoChain networks public testnet"
  },
  401697: {
    name: "tobalaba",
    description: "the public Energy Web Foundation testnet"
  },
  7762959: {name: "musicoin", description: "the music blockchain"},
  61717561: {name: "aquachain", description: "ASIC resistant chain"},
  "*": {name: "local", description: "Likely to be a local test network"}
};

const NETWORK_NAME_TO_ID = Object.keys(NETWORK_ID_TO_NAME).reduce(
  (acc, cur) => (acc[NETWORK_ID_TO_NAME[cur].name.toLowerCase()] = cur) && acc,
  {}
);

function getNetworkInfo(networkId) {
  return NETWORK_ID_TO_NAME[networkId] || NETWORK_ID_TO_NAME["*"];
}

const prompt = async question => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve =>
    rl.question(question, line => {
      rl.close();
      resolve(line.trim().toLowerCase());
    })
  );
};

module.exports = {
  getNetworkInfo,
  prompt
};
