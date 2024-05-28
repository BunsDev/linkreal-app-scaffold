// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RealEstateTokenRegistry.sol";

contract AssetValueUpdater is Pausable, AccessControl {
	bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

	constructor(address defaultAdmin, address pauser) {
		_grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
		_grantRole(PAUSER_ROLE, pauser);
	}

	// TODO: make chainlink keepers call these functions daily

	function updateAssetValueAppraisal(
		address realEstateTokenRegistry,
		uint propertyId
	) public {
		uint newValue = 100; // TODO: fetch from zestimates via chainlink functions
		RealEstateTokenRegistry(realEstateTokenRegistry).updateAssetAppraisal(
			propertyId,
			newValue
		);
	}

	function pause() public onlyRole(PAUSER_ROLE) {
		_pause();
	}

	function unpause() public onlyRole(PAUSER_ROLE) {
		_unpause();
	}
}
