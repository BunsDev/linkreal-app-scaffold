// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract RealEstateTokenRegistry is
	ERC1155,
	AccessControl,
	ERC1155Pausable,
	ERC1155Burnable,
	ERC1155Supply
{
	bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
	bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct PropertyData {
        string propertyAddress;
        uint propertyValue; // should get updated daily
        uint propertyId;
        uint propertyOwner;
        uint propertyGuarantor;
        bytes32 propertyOwnershipProof;
    }

    mapping (address => bytes32) propertyOwnerIdProof;
    mapping (address => bytes32) gurranterIdProof; // maybe gurantors don't need ID proofs. they can list public adddress on theri web. idk.
    mapping (uint => PropertyData) propertyData;

	constructor(
		address defaultAdmin,
		address pauser,
		address minter
	) ERC1155("") {
		_grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
		_grantRole(PAUSER_ROLE, pauser);
		_grantRole(MINTER_ROLE, minter);
	}

	function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
		_setURI(newuri);
	}

	function pause() public onlyRole(PAUSER_ROLE) {
		_pause();
	}

	function unpause() public onlyRole(PAUSER_ROLE) {
		_unpause();
	}

	function issueRWA(
		address propertyOwnerAddress,
		uint256 id,
		uint256 assetShares,
		bytes memory data,
        bytes memory attestation, // I don't know how to do this exactly yet. Let's see.
        uint propertyId
	) public onlyRole(MINTER_ROLE) {
        // 1. Does propertyOwnerAddress has a valid ID proof? ( check via mappinng )
        // 2. Does propertyOwnerAddress has some sort of proof/attestation for the property?
		_mint(propertyOwnerAddress, id, assetShares, data);
	}

    function provideGurantee(
        address propertyOwnerAddress,
        uint propertyId,
        uint collateralAmount,
        address guarantorAddress
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        // Third party asset holder companies, guarantors, insurance companies, etc can provide guarantee for the property
        // Optionally, the gurantee claim can be backed by collateral that's equal to the value of property. 
    }

	function issueRWABatch(
		address to,
		uint256[] memory ids,
		uint256[] memory amounts,
		bytes memory data
	) public onlyRole(MINTER_ROLE) {
		_mintBatch(to, ids, amounts, data);
	}

	// The following functions are overrides required by Solidity.

	function _update(
		address from,
		address to,
		uint256[] memory ids,
		uint256[] memory values
	) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
		super._update(from, to, ids, values);
	}

	function supportsInterface(
		bytes4 interfaceId
	) public view override(ERC1155, AccessControl) returns (bool) {
		return super.supportsInterface(interfaceId);
	}
}
