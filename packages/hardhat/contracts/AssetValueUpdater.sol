// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RealEstateTokenRegistry.sol";
import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

error OnlyAutomationForwarderCanCall();

contract AssetValueUpdater is Pausable, AccessControl, FunctionsClient {
	using FunctionsRequest for FunctionsRequest.Request;

	RealEstateTokenRegistry public realEstateTokenRegistry;

	address internal s_automationForwarderAddress;

	bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

	struct PriceDetails {
		uint80 listPrice;
		uint80 originalListPrice;
		uint80 taxAssessedValue;
	}

	mapping(uint256 tokenId => PriceDetails) internal s_priceDetails;

	// modifier onlyAutomationForwarder() {
	// 	if (msg.sender != s_automationForwarderAddress) {
	// 		revert OnlyAutomationForwarderCanCall();
	// 	}
	// 	_;
	// }

	constructor(
		address defaultAdmin,
		address pauser,
		address functionsRouterAddress,
		address realEstateTokenRegistryAddress
	) FunctionsClient(functionsRouterAddress) {
		_grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
		_grantRole(PAUSER_ROLE, pauser);
		realEstateTokenRegistry = RealEstateTokenRegistry(
			realEstateTokenRegistryAddress
		);
	}

	// function setAutomationForwarder(
	// 	address automationForwarderAddress
	// ) external onlyRole(DEFAULT_ADMIN_ROLE) {
	// 	s_automationForwarderAddress = automationForwarderAddress;
	// }

	// TODO: make chainlink keepers call these functions daily via custom logic automation, for preset and pre paid users
	function updatePriceDetailsInitiate(
		address propertyOwner,
		uint256 propertyId,
		uint64 subscriptionId,
		uint32 gasLimit,
		bytes32 donID,
		string memory source
	) external returns (bytes32 requestId) {
		FunctionsRequest.Request memory req;
		req.initializeRequestForInlineJavaScript(source);

		string[] memory args = new string[](2);
		args[0] = string(abi.encode(propertyId));
		args[1] = string(abi.encode(propertyOwner));

		req.setArgs(args);

		requestId = _sendRequest(
			req.encodeCBOR(),
			subscriptionId,
			gasLimit,
			donID
		);
	}

	function pause() public onlyRole(PAUSER_ROLE) {
		_pause();
	}

	function unpause() public onlyRole(PAUSER_ROLE) {
		_unpause();
	}

	function fulfillRequest(
		bytes32 /*requestId*/,
		bytes memory response,
		bytes memory /*err*/
	) internal override {
		(
			address propertyOwner,
			uint256 propertyId,
			uint256 listPrice,
			uint256 originalListPrice,
			uint256 taxAssessedValue
		) = abi.decode(response, (address, uint256, uint256, uint256, uint256));

		// TODO: make hardcoded weights configurable
		uint weightListPrice = 50;
		uint weightOriginalListPrice = 30;
		uint weightTaxAssessedValue = 20;

		uint256 valuation = (weightListPrice *
			listPrice +
			weightOriginalListPrice *
			originalListPrice +
			weightTaxAssessedValue *
			taxAssessedValue) /
			(weightListPrice +
				weightOriginalListPrice +
				weightTaxAssessedValue);

		realEstateTokenRegistry.updateAssetAppraisal(
			propertyOwner,
			propertyId,
			valuation
		);

		s_priceDetails[propertyId] = PriceDetails({
			listPrice: uint80(listPrice),
			originalListPrice: uint80(originalListPrice),
			taxAssessedValue: uint80(taxAssessedValue)
		});
	}
}
