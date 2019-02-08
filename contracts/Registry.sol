pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Registry is Ownable {
  struct Certification {
    address certifier;
    bytes32 proof;
    uint256 expirationDate;
  }

  mapping(address => Certification) public certifications;

  function addCertification(address _address, bytes32 _proof, uint256 _expirationDate) onlyOwner public {
    certifications[_address] = Certification({
      certifier: msg.sender,
      proof: _proof,
      expirationDate: _expirationDate
    });
  }
}

