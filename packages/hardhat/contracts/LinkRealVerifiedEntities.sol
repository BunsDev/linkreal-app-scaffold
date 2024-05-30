// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract LinkRealVerifiedEntities is Pausable, AccessControl {
	bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
	bytes32 public constant OWNERSHIP_VERIFIER_ROLE =
		keccak256("OWNERSHIP_VERIFIER_ROLE");
	bytes32 public constant GUARANTOR_ROLE = keccak256("GUARANTOR_ROLE");

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

	mapping(address => OwnershipVeriferData) public ownershipVerifierData; // verifierAddress => OwnershipVeriferData
	mapping(address => GuarantorData) public guarantorData; // guarantorAddress => GuarantorData

	struct PropertyOwnershipVerificationRequest {
		address propertyOwner;
		uint propertyId;
		address requestedVerifier;
		bool isApproved;
	}
	struct PropertyGuaranteeRequest {
		address propertyOwner;
		uint propertyId;
		address requestedGuarantor;
		bool isApproved;
	}

	mapping(address => PropertyOwnershipVerificationRequest[])
		private _ownershipVerificationRequestsByVerifier; // verifierAddress => PropertyOwnershipVerificationRequest[]
	mapping(address => PropertyGuaranteeRequest[])
		private _guaranteeRequestsByGuarantor; // guarantorAddress => PropertyGuaranteeRequest[]

	// mapping(address => mapping(address => uint[])) public ownershipVerificationRequests; // verifer[propertyOwner] => propertyIds
	// mapping(address => mapping(address => uint[])) public guaranteeRequests; // guarantor[propertyOwner] => propertyIds

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

	function ownershipVerificationRequestsByVerifier(
		address verifierAddress
	) public view returns (PropertyOwnershipVerificationRequest[] memory) {
		return _ownershipVerificationRequestsByVerifier[verifierAddress];
	}

	function guaranteeRequestsByGuarantor(
		address guarantorAddress
	) public view returns (PropertyGuaranteeRequest[] memory) {
		return _guaranteeRequestsByGuarantor[guarantorAddress];
	}

	/**
	 * @dev This requesting ownership verification can be done via this function or off-chain logic
	 */
	function requestOwnershipVerification(
		address propertyOwner,
		uint propertyId,
		address requestedVerifier
	) public {
		require(isOwnershipVerifier(requestedVerifier), "Invalid verifier");
		// save ownership verification request
		_ownershipVerificationRequestsByVerifier[requestedVerifier].push(
			PropertyOwnershipVerificationRequest(
				propertyOwner,
				propertyId,
				requestedVerifier,
				false
			)
		);
	}

	/**
	 * @dev This requesting guarantee can be done via this function or off-chain logic
	 */
	function requestGuarantee(
		address propertyOwner,
		uint propertyId,
		address requestedGuarantor
	) public {
		require(isGuarantor(requestedGuarantor), "Invalid guarantor");
		// save guarantee request
		_guaranteeRequestsByGuarantor[requestedGuarantor].push(
			PropertyGuaranteeRequest(
				propertyOwner,
				propertyId,
				requestedGuarantor,
				false
			)
		);
	}

	/**
	 * @dev This function just used temporaily to get request status to frontend via one function call. Request status should be either stored off chain or fetch from PropertyData onchain
	 */
	function approveOwnershipVerificationRequest(
		address propertyOwner,
		uint propertyId
	) public onlyRole(OWNERSHIP_VERIFIER_ROLE) {
		PropertyOwnershipVerificationRequest[]
			storage requests = _ownershipVerificationRequestsByVerifier[
				msg.sender
			];
		for (uint i = 0; i < requests.length; i++) {
			if (
				requests[i].propertyOwner == propertyOwner &&
				requests[i].propertyId == propertyId
			) {
				requests[i].isApproved = true;
				break;
			}
		}
	}

	/**
	 * @dev This function just used temporaily to get request status to frontend via one function call.
	 */
	function approveGuaranteeRequest(
		address propertyOwner,
		uint propertyId
	) public onlyRole(GUARANTOR_ROLE) {
		PropertyGuaranteeRequest[]
			storage requests = _guaranteeRequestsByGuarantor[msg.sender];
		for (uint i = 0; i < requests.length; i++) {
			if (
				requests[i].propertyOwner == propertyOwner &&
				requests[i].propertyId == propertyId
			) {
				requests[i].isApproved = true;
				break;
			}
		}
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
		_grantRole(OWNERSHIP_VERIFIER_ROLE, verifierAddress);
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
		_grantRole(GUARANTOR_ROLE, guarantorAddress);
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
