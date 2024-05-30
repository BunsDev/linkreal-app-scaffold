// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import "./RealEstateTokenRegistry.sol";

/**
 * This is a simple  contract for purchasing LinkReal platform tokenized real estate assets.
 * Buyers can purchase either partial or full ownership of the Properties listed form RealEstateTokenRegistry contract.
 */
contract RealEstateTokenMarketplace {
	RealEstateTokenRegistry public realEstateTokenRegistry;

	event TokensSold(
		address indexed buyer,
		address indexed seller,
		uint indexed propertyId,
		uint fractionsCount
	);

	constructor(address _realEstateTokenRegistry) {
		realEstateTokenRegistry = RealEstateTokenRegistry(
			_realEstateTokenRegistry
		);
	}

	/**
	 * @dev Purchase a fraction of a property
	 * @notice User should approve the contract to transfer the tokens on their behalf before calling this function
	 * @param propertyOwner The owner of the property
	 * @param propertyId The id of the property
	 * @param fractionsCount The number of fractions to purchase
	 */
	function purchasePropertyFraction(
		address propertyOwner,
		uint propertyId,
		uint fractionsCount
	) public {
		realEstateTokenRegistry.safeTransferFrom(
			propertyOwner,
			msg.sender,
			propertyId,
			fractionsCount,
			""
		);
		emit TokensSold(msg.sender, propertyOwner, propertyId, fractionsCount);
	}
}
