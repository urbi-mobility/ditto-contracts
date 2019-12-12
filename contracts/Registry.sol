pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";

contract Registry is WhitelistedRole {
    event CertificationAdded(address indexed account);
    event CertificationRemoved(address indexed account);

    struct Certification {
        address certifier;
        bytes32 proof;
        uint256 expirationDate;
    }

    mapping(address => Certification) public certifications;

    constructor() public WhitelistedRole() {}

    function addCertification(
        address account,
        bytes32 proof,
        uint256 expirationDate
    ) public onlyWhitelisted {
        require(certifications[account].certifier == address(0), "Certification already exists.");
        certifications[account] = Certification({
            certifier: msg.sender,
            proof: proof,
            expirationDate: expirationDate
        });
        emit CertificationAdded(account);
    }

    function removeCertification(address account) public {
        require(
            account == msg.sender ||
                certifications[account].certifier == msg.sender,
            "You are not the owner of this certification."
        );
        delete certifications[account];
        emit CertificationRemoved(account);
    }
}
