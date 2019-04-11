const registryContract = require("../build/contracts/Registry.json");
const { keccak256 } = require("web3-utils");

function stringTimestamp(date) {
  date = date || new Date();
  return Math.round(date.getTime() / 1000).toString();
}

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

async function register(web3, userAddress, userData, certifierAddress) {
  const contract = new web3.eth.Contract(
    registryContract.abi,
    registryContract.networks[await web3.eth.net.getId()].address
  );

  const signedData = {
    address: userAddress,
    signature: await web3.eth.sign(serialize(userData), userAddress),
    data: userData
  };

  const [year, month, day] = userData.dlExpirationDate.split("-");

  const receipt = await contract.methods
    .addCertification(
      signedData.address,
      keccak256(serialize(signedData.data)),
      // Expiration Date approximation
      stringTimestamp(new Date(year, month - 1, day - 1))
    )
    .send({ from: certifierAddress });
}

module.exports = { serialize, register, stringTimestamp };
