// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { EMPTY_UID } from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

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
	bytes32 public constant ASSET_VALUE_UPDATER_ROLE =
		keccak256("ASSET_VALUE_UPDATER_ROLE");
	bytes32 public constant ASSET_APPRAISAL_UPDATER_ROLE =
		keccak256("ASSET_APPRAISAL_UPDATER_ROLE");

	IEAS public easContractInstance;

	/**
	 * @dev below attestation UIDs are stored in EAS.sol and can be verified by anyone.
	 */
	struct PropertyData {
		address propertyOwner;
		uint propertyId;
		string propertyAddress;
		uint propertyValue; // should get updated daily
		uint propertyValueAppraisal; // should get updated daily
		uint propertyFractionsCount;
		address propertyOwnershipVerifier;
		address propertyGuarantor;
		bytes32 propertyOwnerShipVerifierAttestationUID;
		bytes32 propertyGuarantorAttestationUID;
		uint propertyCollateralAmount;
		bytes32 propertyOwnerTOSAttastationUID;
	}

	mapping(address => PropertyData) propertyData;

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

	function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
		_setURI(newuri);
	}

	function pause() public onlyRole(PAUSER_ROLE) {
		_pause();
	}

	function unpause() public onlyRole(PAUSER_ROLE) {
		_unpause();
	}

	/**
	 * @notice For now the ownership verifier has to have called attest function in EAS.sol previously.
	 */
	function provideGurantee(
		address propertyOwnerAddress,
		bytes32 attestationUID
	) public payable {
		// Third party asset holder companies, guarantors, insurance companies, etc can provide guarantee for the property
		// Optionally, the gurantee claim can be backed by collateral that's equal to the value of property.
		address guarantorAddress = msg.sender;
		bool isGuarantor = hasRole(GUARANTOR_ROLE, guarantorAddress);
		uint collateralAmount = msg.value;
		uint requiredCollateralAmount = propertyData[propertyOwnerAddress]
			.propertyValueAppraisal; // apprased value is used in here, instead of current value ( value of tokens )
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
			propertyData[propertyOwnerAddress]
				.propertyGuarantor = guarantorAddress;
			propertyData[propertyOwnerAddress]
				.propertyGuarantorAttestationUID = attestationUID;
		} else if (collateralAmount >= requiredCollateralAmount) {
			propertyData[propertyOwnerAddress]
				.propertyCollateralAmount = collateralAmount;
		}
	}

	/**
	 * @notice For now the ownership verifier has to have called attest function in EAS.sol previously.
	 */
	function provideOwnershipVerification(
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
		propertyData[propertyOwnerAddress]
			.propertyOwnershipVerifier = ownershipVerifierAddress;
		propertyData[propertyOwnerAddress]
			.propertyOwnerShipVerifierAttestationUID = attestationUID;
	}

	/**
	 * @notice ASSET_VALUE_UPDATER_ROLE has to be assigned, preferably only to the AssetValueUpdater.sol contract.
	 */
	function updateAssetValue(
		address propertyOwnerAddress,
		uint newValue
	) public onlyRole(ASSET_VALUE_UPDATER_ROLE) {
		propertyData[propertyOwnerAddress].propertyValue = newValue;
	}

	/**
	 * @notice ASSET_APPRAISAL_UPDATER_ROLE has to be assigned, preferably only to the AssetValueUpdater.sol contract.
	 */
	function updateAssetAppraisal(
		address propertyOwnerAddress,
		uint newValue
	) public onlyRole(ASSET_APPRAISAL_UPDATER_ROLE) {
		propertyData[propertyOwnerAddress].propertyValueAppraisal = newValue;
	}

	function issueRWA(
		address propertyOwnerAddress,
		uint256 id,
		uint256 assetShares,
		bytes memory data
	) public onlyRole(MINTER_ROLE) {
		_validateIssuance(propertyOwnerAddress);
		_mint(propertyOwnerAddress, id, assetShares, data);
	}

	function issueRWABatch(
		address propertyOwnerAddress,
		uint256[] memory ids,
		uint256[] memory amounts,
		bytes memory data
	) public onlyRole(MINTER_ROLE) {
		_validateIssuance(propertyOwnerAddress);
		_mintBatch(propertyOwnerAddress, ids, amounts, data);
	}

	function _validateIssuance(address propertyOwner) internal view {
		PropertyData memory property = propertyData[propertyOwner];
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
