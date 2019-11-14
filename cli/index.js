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
const {bigNumberify, parseUnits} = ethers.utils;
const log = console.log;
const {prompt, promisify} = require("util");

const CONTRACT = "Registry";
const SOURCE_DIR = "contracts";
const BUILD_DIR = "build/contracts";
const CONTRACT_FILE = path.join(SOURCE_DIR, CONTRACT + ".sol");
const CONTRACT_METADATA_FILE = path.join(BUILD_DIR, CONTRACT + ".json");

async function getContext(program) {
  let provider;
  let contract;
  let contractMetadata;
  let chainId;
  const network =
    program.network === "local" ? "http://localhost:8545" : program.network;

  if (network.startsWith("http")) {
    provider = new ethers.providers.JsonRpcProvider(network);
  } else {
    provider = ethers.getDefaultProvider(network);
  }

  try {
    chainId = (await provider.getNetwork()).chainId;
  } catch (e) {
    if (e.statusCode !== 0) {
      throw e;
    }
    console.error("Error: cannot connect to", network);
    process.exit(1);
  }

  try {
    contractMetadata = JSON.parse(fs.readFileSync(CONTRACT_METADATA_FILE));
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
    console.error(
      "Error: cannot find contract metadata, did you deploy the smart contract?"
    );
    process.exit(1);
  }

  const contractAddress = contractMetadata.networks[chainId].address;
  const contractAbi = contractMetadata.abi;

  const wallet = new ethers.Wallet(process.env.SECRET, provider);
  if (contractAddress) {
    contract = new ethers.Contract(contractAddress, contractAbi, wallet);
  }

  return {
    wallet,
    chainId,
    provider,
    contract,
    contractMetadata,
    network,
    dryRun: program.dryrun,
    yes: program.yes,
    gasLimit: program.gaslimit,
    gasPrice:
      program.gasprice === "auto"
        ? "auto"
        : parseUnits(program.gasprice, "gwei")
  };
}

async function info({wallet, chainId, contractMetadata, network}) {
  const networks = contractMetadata.networks;

  log("Wallet address:", c.green(wallet.address));
  log(
    "Wallet funds:",
    c.green(ethers.utils.formatEther(await wallet.getBalance())),
    "ETH"
  );
  log("Connected to network:", c.green(network));
  log("Using contract located in:", c.green(CONTRACT_FILE));
  log();
  log("Contract deployed to:");
  Object.keys(networks).forEach(networkId => {
    const name = utils.getNetworkInfo(networkId).name;
    if (networkId === chainId.toString()) {
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
  const gweiTimes100 = (await resp.json()).average * 10;
  const wei = parseUnits(gweiTimes100.toString(), "gwei").div(100);
  return wei;
}

async function call(name, params, {contract, provider, gasPrice, gasLimit}) {
  let gas;
  let est;

  try {
    est = await contract.estimate[name](...params);
  } catch (e) {
    if (e.code === -32000) {
      console.error(
        "Simulation call fails:",
        JSON.parse(e.responseText).error.message
      );
      process.exit(1);
    }
    throw e;
  }

  if (gasPrice === "auto") {
    gas = await getGasPrice();
  } else {
    gas = gasPrice;
  }

  const rate = await getRate();
  const euros =
    est
      .mul(gas)
      .mul(rate * 100)
      .div("1000000000000000")
      .toNumber() / 100000;
  log("Calling", c.green(name));
  log("Parameters:\n  -", params.join("\n  - "));
  log();
  log("Estimated gas:", c.green(est.toString()));
  log(
    "Average gas price:",
    c.green(gas.div("100000000").toNumber() / 10),
    "Gwei"
  );
  log("Estimated cost:", c.green(euros), "€");
  if ((await prompt("Continue? (yes/no)")) !== "y") {
    return;
  }
  try {
    const overrides = {gasPrice};
    if (gasPrice !== "auto") {
      overrides.gasPrice = gasPrice;
    }
    if (gasLimit !== "auto") {
      overrides.gasLimit = gasLimit;
    }
    const receipt = await contract.functions[name](...params, overrides);
    log(receipt);
  } catch (e) {
    throw e;
  }
}

async function adminAdd(address, ctx) {
  return await call("addWhitelistAdmin", [address], ctx);
}

function prepare(callback) {
  return async (...args) => {
    const opts = args.pop();
    const ctx = await getContext(program);
    return callback(...args, {...opts, ...ctx});
  };
}

program.version("0.0.1");
program
  .option("-n, --network <name>", "Network to connect to", "local")
  .option("-d, --dryrun", "Don't commit things on blockchain")
  .option("-y, --yes", "Don't ask for confirmation")
  .option("-l, --gaslimit <limit>", "Gas limit", "auto")
  .option("-p, --gasprice <price>", "Gas price in Gwei", "auto")
  .command("info")
  .action(prepare(info));

program.command("admin-add <address>").action(prepare(adminAdd));
try {
  program.parse(process.argv);
} catch (e) {
  console.log(e);
}
