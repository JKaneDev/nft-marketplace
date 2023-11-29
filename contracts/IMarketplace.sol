// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IMarketplace {
        function handleAuctionEnd(uint256 tokenId, address highestBidder) external;
}