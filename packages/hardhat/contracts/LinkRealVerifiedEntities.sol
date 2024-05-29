// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract LinkRealVerifiedEntities is Pausable, AccessControl {
	bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

	struct OwnershipVeriferData {
		address verifierAddress;
		string ownershipVerifierName;
		string ownershipVerifierPublicURL;
	}
	address[] public ownershipVerifiers;

	struct GuarantorData {
		address guarantorAddress;
		string guarantorName;
		string guarantorPublicURL;
	}
	address[] public guarantors;

	OwnershipVeriferData[] public ownershipVerifierDataArray; // TODO: remove reduntant data storage onchain and fetch via offchain DS
	GuarantorData[] public guarantorDataArray; // TODO: remove reduntant data storage onchain and fetch via offchain DS

	mapping(address => OwnershipVeriferData) public ownershipVerifierData;
	mapping(address => GuarantorData) public guarantorData;

	mapping(address => uint[]) public ownershipVerificationRequests; // verifer => propertyIds
	mapping(address => uint[]) public guaranteeRequests; // guarantor => propertyIds

	event OwnershipVerifierDataAdded(
		address indexed verifierAddress,
		string verifierName,
		string verifierPublicURL
	);
	event GuarantorDataAdded(
		address indexed guarantorAddress,
		string guarantorName,
		string guarantorPublicURL
	);

	constructor(address defaultAdmin, address pauser) {
		_grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
		_grantRole(PAUSER_ROLE, pauser);
	}

	function isOwnershipVerifier(
		address verifierAddress
	) public view returns (bool) {
		return
			bytes(ownershipVerifierData[verifierAddress].ownershipVerifierName)
				.length != 0;
	}

	function isGuarantor(address guarantorAddress) public view returns (bool) {
		return bytes(guarantorData[guarantorAddress].guarantorName).length != 0;
	}

	function returnOwnershipVeriferStructs()
		public
		view
		returns (OwnershipVeriferData[] memory)
	{
		return ownershipVerifierDataArray;
	}

	function returnGuarantorStructs()
		public
		view
		returns (GuarantorData[] memory)
	{
		return guarantorDataArray;
	}

	/**
	 * @dev This requesting ownership verification can be done via this function or off-chain logic
	 */
	function requestOwnershipVerification(
		uint propertyId,
		address requestedVerifier
	) public {
		require(isOwnershipVerifier(requestedVerifier), "Invalid verifier");
		// save ownership verification request
		ownershipVerificationRequests[requestedVerifier].push(propertyId);
	}

	/**
	 * @dev This requesting guarantee can be done via this function or off-chain logic
	 */
	function requestGuarantee(
		uint propertyId,
		address requestedGuarantor
	) public {
		require(isGuarantor(requestedGuarantor), "Invalid guarantor");
		// save guarantee request
		guaranteeRequests[requestedGuarantor].push(propertyId);
	}

	function setOwnershipVerifierData(
		address verifierAddress,
		string memory verifierName,
		string memory verifierPublicURL
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		OwnershipVeriferData memory _verifierData = OwnershipVeriferData(
			verifierAddress,
			verifierName,
			verifierPublicURL
		);
		ownershipVerifierData[verifierAddress] = _verifierData;
		ownershipVerifiers.push(verifierAddress);
		ownershipVerifierDataArray.push(_verifierData);
		emit OwnershipVerifierDataAdded(
			verifierAddress,
			verifierName,
			verifierPublicURL
		);
	}

	function setGuarantorData(
		address guarantorAddress,
		string memory guarantorName,
		string memory guarantorPublicURL
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		GuarantorData memory _guarantorData = GuarantorData(
			guarantorAddress,
			guarantorName,
			guarantorPublicURL
		);
		guarantorData[guarantorAddress] = _guarantorData;
		guarantors.push(guarantorAddress);
		guarantorDataArray.push(_guarantorData);
		emit GuarantorDataAdded(
			guarantorAddress,
			guarantorName,
			guarantorPublicURL
		);
	}

	function pause() public onlyRole(PAUSER_ROLE) {
		_pause();
	}

	function unpause() public onlyRole(PAUSER_ROLE) {
		_unpause();
	}
}
