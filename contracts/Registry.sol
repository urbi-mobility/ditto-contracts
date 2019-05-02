pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";

contract Registry is WhitelistedRole {
  struct Certification {
    address certifier;
    bytes32 proof;
    uint256 expirationDate;
  }

  mapping(address => Certification) public certifications;

	constructor() WhitelistedRole() public {}

  function addCertification(address user, bytes32 proof, uint256 expirationDate) onlyWhitelisted public {
    certifications[user] = Certification({
      certifier: msg.sender,
      proof: proof,
      expirationDate: expirationDate
    });
  }
}
