// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { EMPTY_UID } from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";
import "hardhat/console.sol";

error LinkReal__InvalidGuarantor();
error LinkReal__InvalidGuarantorAttestation();
error LinkReal__InvalidOwnershipVerifierAttestation();
error LinkReal__AttestationOrCollateralRequired();

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
	bytes32 public constant OWNERSHIP_VERIFIER_ROLE =
		keccak256("OWNERSHIP_VERIFIER_ROLE");
	bytes32 public constant GUARANTOR_ROLE = keccak256("GUARANTOR_ROLE");
	bytes32 public constant ASSET_APPRAISAL_UPDATER_ROLE =
		keccak256("ASSET_APPRAISAL_UPDATER_ROLE");

	IEAS public easContractInstance;

	/**
	 * @dev below attestation UIDs are stored in EAS.sol and can be verified by anyone.
	 */
	struct PropertyData {
		address propertyOwner;
		uint propertyId; // this propertyId is not unique across all properties. Unique only for a propertyOwner
		string propertyAddress;
		uint propertyListValue; // should get updated daily
		uint propertyValueAppraisal; // should get updated daily
		uint propertyFractionsCount;
		address propertyOwnershipVerifier;
		address propertyGuarantor;
		bytes32 propertyOwnerShipVerifierAttestationUID;
		bytes32 propertyGuarantorAttestationUID;
		uint propertyCollateralAmount;
		bytes32 propertyOwnerTOSAttastationUID;
		propertyMetadata metadata;
		bool isListed;
	}

	// To temporarliy make stack too deep error go away
	struct propertyMetadata {
		string propertyImageURL;
		string description;
	}

	// mapi public currentPropertyIdCount = 0; //
	mapping(address => uint) public currentPropertyIdCount; // Include the unlisted properties as well

	mapping(address => mapping(uint => PropertyData)) private _propertyData; // propertyOwner[propertyId] => PropertyData

	// TODO: remove reduntant data storage onchain and fetch via offchain DS
	mapping(address => PropertyData[]) private _propertyDataByOwner; // propertyOwner => PropertyData[]

	PropertyData[] public allPropertyDataArray; // For temporaily use

	constructor(
		address defaultAdmin,
		address pauser,
		address minter,
		address easContractAddress
	) ERC1155("") {
		_grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
		_grantRole(PAUSER_ROLE, pauser);
		_grantRole(MINTER_ROLE, minter);
		easContractInstance = IEAS(easContractAddress);
	}

	function propertyData(
		address propertyOwner,
		uint propertyId
	) public view returns (PropertyData memory) {
		PropertyData memory p = _propertyData[propertyOwner][propertyId];
		return p;
	}

	function propertyDataByOwner(
		address owner
	) public view returns (PropertyData[] memory) {
		return _propertyDataByOwner[owner];
	}

	function allPropertyData() public view returns (PropertyData[] memory) {
		return allPropertyDataArray;
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

	function submitUnlistedProperty(
		address propertyOwner,
		string memory propertyAddress,
		uint propertyListValue,
		uint propertyFractionsCount,
		string memory propertyImageURL,
		string memory description
	) public {
		uint propertyId = currentPropertyIdCount[propertyOwner] + 1; // Property IDs start from 1
		PropertyData memory _propertyDataMemory = PropertyData({
			propertyOwner: propertyOwner,
			propertyId: propertyId,
			propertyAddress: propertyAddress,
			propertyListValue: propertyListValue,
			propertyValueAppraisal: 0,
			propertyFractionsCount: propertyFractionsCount,
			propertyOwnershipVerifier: address(0),
			propertyGuarantor: address(0),
			propertyOwnerShipVerifierAttestationUID: EMPTY_UID,
			propertyGuarantorAttestationUID: EMPTY_UID,
			propertyCollateralAmount: 0,
			propertyOwnerTOSAttastationUID: EMPTY_UID,
			metadata: propertyMetadata({
				propertyImageURL: propertyImageURL,
				description: description
			}),
			isListed: false
		});
		_propertyData[propertyOwner][propertyId] = _propertyDataMemory;
		currentPropertyIdCount[propertyOwner] = propertyId;
		_propertyDataByOwner[propertyOwner].push(_propertyDataMemory);
	}

	/**
	 * @notice For now the ownership verifier has to have called attest function in EAS.sol previously.
	 * @dev TODO: make use of delegateAttest and call attest function inside this function.
	 *
	 */
	function provideGurantee(
		uint propertyId,
		address propertyOwnerAddress,
		bytes32 attestationUID
	) public payable {
		// Third party asset holder companies, guarantors, insurance companies, etc can provide guarantee for the property
		// Optionally, the gurantee claim can be backed by collateral that's equal to the value of property.
		address guarantorAddress = msg.sender;
		bool isGuarantor = hasRole(GUARANTOR_ROLE, guarantorAddress);
		uint collateralAmount = msg.value;
		uint requiredCollateralAmount = _propertyData[propertyOwnerAddress][
			propertyId
		].propertyValueAppraisal; // apprased value is used in here, instead of current value ( value of tokens )
		if (collateralAmount <= requiredCollateralAmount && !isGuarantor) {
			revert LinkReal__InvalidGuarantor();
		}
		if (isGuarantor) {
			bool isValidAttestation = _checkAttestationValidity(
				guarantorAddress,
				propertyOwnerAddress,
				attestationUID
			);
			if (!isValidAttestation) {
				revert LinkReal__InvalidGuarantorAttestation();
			}
			_propertyData[propertyOwnerAddress][propertyId]
				.propertyGuarantor = guarantorAddress;
			_propertyData[propertyOwnerAddress][propertyId]
				.propertyGuarantorAttestationUID = attestationUID;
		} else if (collateralAmount >= requiredCollateralAmount) {
			_propertyData[propertyOwnerAddress][propertyId]
				.propertyCollateralAmount = collateralAmount;
		}
	}

	/**
	 * @notice For now the ownership verifier has to have called attest function in EAS.sol previously.
	 * @dev TODO: make use of delegateAttest and call attest function inside this function.
	 */
	function provideOwnershipVerification(
		uint propertyId,
		address propertyOwnerAddress,
		bytes32 attestationUID
	) public onlyRole(OWNERSHIP_VERIFIER_ROLE) {
		address ownershipVerifierAddress = msg.sender;
		bool isValidAttestation = _checkAttestationValidity(
			ownershipVerifierAddress,
			propertyOwnerAddress,
			attestationUID
		);
		if (!isValidAttestation) {
			revert LinkReal__InvalidOwnershipVerifierAttestation();
		}
		_propertyData[propertyOwnerAddress][propertyId]
			.propertyOwnershipVerifier = ownershipVerifierAddress;
		_propertyData[propertyOwnerAddress][propertyId]
			.propertyOwnerShipVerifierAttestationUID = attestationUID;
	}

	/**
	 * @notice ASSET_APPRAISAL_UPDATER_ROLE has to be assigned, preferably only to the AssetValueUpdater.sol contract.
	 */
	function updateAssetAppraisal(
		address propertyOwnerAddress,
		uint propertyId,
		uint newValue
	) public onlyRole(ASSET_APPRAISAL_UPDATER_ROLE) {
		_propertyData[propertyOwnerAddress][propertyId]
			.propertyValueAppraisal = newValue;
	}

	function issueRWA(
		address propertyOwnerAddress,
		uint256 propertyId,
		uint256 assetShares,
		bool isListed,
		bytes memory data
	) public {
		_validateIssuance(propertyOwnerAddress, propertyId);
		_propertyData[propertyOwnerAddress][propertyId].isListed = isListed;
		allPropertyDataArray.push(
			_propertyData[propertyOwnerAddress][propertyId]
		); // Just temporaily. TODO: remove this
		_mint(propertyOwnerAddress, propertyId, assetShares, data);
	}

	function issueRWABatch(
		address propertyOwnerAddress,
		uint256[] memory propertyIds,
		uint256[] memory assetShareAmounts,
		bool[] memory isListeds,
		bytes memory data
	) public {
		for (uint i = 0; i < propertyIds.length; i++) {
			_validateIssuance(propertyOwnerAddress, propertyIds[i]);
			_propertyData[propertyOwnerAddress][propertyIds[i]]
				.isListed = isListeds[i];
		}
		_mintBatch(propertyOwnerAddress, propertyIds, assetShareAmounts, data);
	}

	function _validateIssuance(
		address propertyOwnerAddress,
		uint propertyId
	) internal view {
		PropertyData memory property = _propertyData[propertyOwnerAddress][
			propertyId
		];
		uint collateralAmount = property.propertyCollateralAmount;
		uint requiredCollateralAmount = property.propertyValueAppraisal;

		if (collateralAmount >= requiredCollateralAmount) {
			// 1. Does propertyOwnerAddress has collataral locked for the property? If so proceed.
			return;
		} else if (property.propertyGuarantorAttestationUID != EMPTY_UID) {
			// 2. If not Does propertyOwnerAddress has guarantor attestation for the property? If so proceed.
			return;
		} else {
			// 3. If not throw error.
			revert LinkReal__AttestationOrCollateralRequired();
		}
	}

	function _checkAttestationValidity(
		address supposedAttester,
		address supposedRecipient,
		bytes32 attestationUID
	) internal view returns (bool) {
		bool isAttestationValid = easContractInstance.isAttestationValid(
			attestationUID
		);
		Attestation memory attestation = easContractInstance.getAttestation(
			attestationUID
		);
		address recipient = attestation.recipient;
		address attester = attestation.attester;
		return
			isAttestationValid &&
			recipient == supposedRecipient &&
			attester == supposedAttester;
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
