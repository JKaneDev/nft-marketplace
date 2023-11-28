// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Auction is ReentrancyGuard {

        address payable seller;
        address payable highestBidder;
        uint256 highestBid;
        bool ended;

        mapping(address => uint256) public pendingReturns;

        event Bid(address bidder, uint256 bidAmount, address auctionAddress);

        constructor(uint256 _nftId, uint256 _startingPrice, uint256 _currentTimestamp, uint256 _auctionDuration, address _seller) {
                seller = payable(_seller);
        }

        function withdraw() public returns (bool) {
                uint256 amount = pendingReturns[msg.sender];

                // Execute withdrawal if user has funds to withdraw
                if (amount > 0) {
                        pendingReturns[msg.sender] = 0;

                        // Alter contract data only if withdrawal is successful
                        if (!payable(msg.sender).send(amount)) {
                                pendingReturns[msg.sender] = amount;
                                return false;
                        }
                }
                return true;
        }

        function bid() public payable nonReentrant {
                require(seller != msg.sender, 'Seller cannot bid on their own auction');
                require(msg.value > highestBid, 'Bid must be greater than current highest bid');
                require(highestBidder != msg.sender, 'Bidder is already highest bidder');

                if (highestBid != 0) {
                        pendingReturns[highestBidder] += highestBid;
                }

                highestBid = msg.value;
                highestBidder = payable(msg.sender);

                emit Bid(msg.sender, msg.value, address(this));
        }
}