#!/usr/bin/env node

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const ethers = require("ethers");
const program = require("commander");
const {version} = require("../package.json");
const c = require("chalk");
const utils = require("./utils");
const log = console.log;

const CONTRACT = "Registry";
const SOURCE_DIR = "contracts";
const BUILD_DIR = "build/contracts";
const CONTRACT_METADATA = JSON.parse(
  fs.readFileSync(path.join(BUILD_DIR, CONTRACT + ".json"))
);

async function getOptions(program) {
  let provider;
  let contract;
  const network =
    program.network === "local" ? "http://localhost:8545" : program.network;

  if (network.startsWith("http")) {
    provider = new ethers.providers.JsonRpcProvider(network);
  } else {
    provider = ethers.getDefaultProvider(network);
  }

  const {chainId} = await provider.getNetwork();

  const contractAddress = CONTRACT_METADATA.networks[chainId].address;
  const contractAbi = CONTRACT_METADATA.abi;

  const wallet = new ethers.Wallet(process.env.SECRET, provider);
  if (contractAddress) {
    contract = new ethers.Contract(contractAddress, contractAbi, wallet);
  }

  return {
    wallet,
    chainId,
    provider,
    contract
  };
}

function info({wallet}) {
  const networks = CONTRACT_METADATA.networks;

  log("Wallet address:", c.green(wallet.address));
  log("Connected to network:", c.green(program.network));
  log(
    "Using contract located in:",
    c.green(path.join(SOURCE_DIR, CONTRACT + ".sol"))
  );
  log();
  log("Contract deployed to:");
  Object.keys(networks).forEach(networkId => {
    const name = utils.getNetworkInfo(networkId).name;
    if (name === program.network) {
      log("- Default contract");
    } else {
      log("- Switch network to use this contract");
    }
    log("  network:", c.green(name));
    log("  network id:", c.green(networkId));
    log("  address:", c.green(networks[networkId].address));
    log("  transaction:", c.green(networks[networkId].transactionHash));
    log();
  });
}

async function getRate() {
  const resp = await fetch(
    "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR"
  );
  const rate = await resp.json();
  return rate.EUR;
}

async function getGasPrice() {
  const resp = await fetch("https://ethgasstation.info/json/ethgasAPI.json");
  return await resp.json();
}

async function adminAdd({provider, contract}, address) {
  console.log(address);
  let est;
  try {
    est = await contract.estimate.addWhitelistAdmin(address);
  } catch (e) {
    console.error("Call simulation fails", e);
    return;
  }
  const gasPrice = await provider.getGasPrice();
  const rate = ethers.utils.bigNumberify((await getRate()) * 100);

  log(
    rate.toString(),
    est.toString(),
    gasPrice.toString(),
    ethers.utils.formatUnits(gasPrice, "gwei").toString()
  );
  const wei = est
    .mul(gasPrice)
    .mul(rate)
    .div(ethers.utils.bigNumberify(100))
    .toString();
  log(ethers.utils.formatEther(wei));
}

function run(callback) {
  return async (...args) => callback(await getOptions(program), ...args);
}

program.version("0.0.1");
program
  .option("-n, --network <name>", "Network to connect to", "local")
  .command("info")
  .action(run(info));

program.command("admin-add <address>").action(run(adminAdd));
try {
  program.parse(process.argv);
} catch (e) {
  console.log(e);
}
