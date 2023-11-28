// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Auction is ReentrancyGuard {

        address payable seller;
        address payable highestBidder;
        uint256 highestBid;
        bool ended;

        mapping(address => uint256) public pendingReturns;

        constructor(uint256 _nftId, uint256 _startingPrice, uint256 _currentTimestamp, uint256 _auctionDuration, address _seller) {
                seller = payable(_seller);
        }

        function bid() public payable nonReentrant {
                require(seller != msg.sender, 'Seller cannot bid on their own auction');
                require(msg.value > highestBid, 'Bid must be greater than current highest bid');
                require(highestBidder != msg.sender, 'Bidder is already highest bidder');

                highestBid = msg.value;
                highestBidder = payable(msg.sender);
        }
}