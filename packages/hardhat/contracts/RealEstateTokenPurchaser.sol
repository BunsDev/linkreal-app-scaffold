// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import "./RealEstateTokenRegistry.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


error PriceFeedDdosed();
error InvalidRoundId();
error StalePriceFeed();

/**
 * This is a simple  contract for purchasing LinkReal platform tokenized real estate assets.
 * Buyers can purchase either partial or full ownership of the Properties listed form RealEstateTokenRegistry contract.
 */
contract RealEstateTokenPurchaser is AccessControl, ReentrancyGuard {
	using SafeERC20 for IERC20;

	RealEstateTokenRegistry public realEstateTokenRegistry;

	AggregatorV3Interface internal s_usdcUsdAggregator;
	uint32 internal s_usdcUsdFeedHeartbeat;

	address internal immutable i_usdc;

	event TokensSold(
		address indexed buyer,
		address indexed seller,
		uint indexed propertyId,
		uint fractionsCount
	);

	constructor(address _realEstateTokenRegistry, address usdc) {
		realEstateTokenRegistry = RealEstateTokenRegistry(
			_realEstateTokenRegistry
		);
		i_usdc = usdc;
	}

	function getUsdcPriceInUsd() public view returns (uint256) {
		uint80 _roundId;
		int256 _price;
		uint256 _updatedAt;
		try s_usdcUsdAggregator.latestRoundData() returns (
			uint80 roundId,
			int256 price,
			uint256,
			/* startedAt */
			uint256 updatedAt,
			uint80 /* answeredInRound */
		) {
			_roundId = roundId;
			_price = price;
			_updatedAt = updatedAt;
		} catch {
			revert PriceFeedDdosed();
		}

		if (_roundId == 0) revert InvalidRoundId();

		if (_updatedAt < block.timestamp - s_usdcUsdFeedHeartbeat) {
			revert StalePriceFeed();
		}

		return uint256(_price);
	}

	function getValuationInUsdc(
		address propertyOwner,
		uint propertyId
	) public view returns (uint256) {
		uint valuation = realEstateTokenRegistry
			.propertyData(propertyOwner, propertyId)
			.propertyValueAppraisal; // this has been set via asset value update contract
		uint256 usdcPriceInUsd = getUsdcPriceInUsd();

		uint256 feedDecimals = s_usdcUsdAggregator.decimals();
		uint256 usdcDecimals = 6; // USDC uses 6 decimals

		uint256 normalizedValuation = Math.mulDiv(
			(valuation * usdcPriceInUsd),
			10 ** usdcDecimals,
			10 ** feedDecimals
		); // Adjust the valuation from USD (Chainlink 1e8) to USDC (1e6)

		return normalizedValuation;
	}

	function setUsdcUsdPriceFeedDetails(
		address usdcUsdAggregatorAddress,
		uint32 usdcUsdFeedHeartbeat
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		s_usdcUsdAggregator = AggregatorV3Interface(usdcUsdAggregatorAddress);
		s_usdcUsdFeedHeartbeat = usdcUsdFeedHeartbeat;
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
	) public nonReentrant {
		uint requiredUsdc = (getValuationInUsdc(propertyOwner, propertyId) /
			100) * fractionsCount; // Total fractions is 100.

		IERC20(i_usdc).safeTransferFrom(msg.sender, propertyOwner, requiredUsdc);

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
