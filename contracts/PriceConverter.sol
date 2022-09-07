// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int256 price, , , ) = priceFeed.latestRoundData();

        // ETH in terms of USD
        // 3000.00000000 (8 decimals)
        return uint256(price * 10000000000); // 1 ** 10 = 10000000000
    }

    function getVersion(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        return priceFeed.version();
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        return ethAmountInUsd;
    }
}
