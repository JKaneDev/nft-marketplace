// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IMarketplace {
        function handleAuctionEnd(uint256 tokenId, address highestBidder) external;
        function getRoyaltyData(uint256 tokenId) external view returns (uint256, address payable);
        function resellMarketItem(uint256 tokenId, uint256 price) external payable;
}