// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IMarketplace.sol";

contract Auction is ReentrancyGuard {

        uint256 nftId;
        address marketplaceAddress;
        IMarketplace marketplaceContract;
        address payable seller;
        uint256 startingPrice;
        address payable highestBidder;
        uint256 highestBid;
        bool ended;

        mapping(address => uint256) public pendingReturns;

        event Bid(address bidder, uint256 bidAmount, address auctionAddress);
        event AuctionEnded(address auctionAddress, uint256 timestamp, uint256 nftId, address seller, uint256 startingPrice, uint256 highestBid);

        constructor(uint256 _nftId, uint256 _startingPrice, address _seller, address _marketplaceAddress) {
                marketplaceAddress = _marketplaceAddress;
                marketplaceContract = IMarketplace(marketplaceAddress);
                nftId = _nftId;
                seller = payable(_seller);
                startingPrice = _startingPrice;
        }

        function withdraw() public returns (bool) {
                require(ended == true, 'User can only withdraw funds after auction has ended');

                uint256 amount = pendingReturns[msg.sender];

                // Execute withdrawal if user has funds to withdraw
                if (amount > 0) {
                        pendingReturns[msg.sender] = 0;
                        (bool sent, ) = payable(msg.sender).call{value: amount}("");

                        // Alter contract data only if withdrawal is successful
                        if (!sent) {
                                pendingReturns[msg.sender] = amount;
                                return false;
                        }
                }
                return true;
        }

        function bid() public payable nonReentrant {
                require(seller != msg.sender, 'Seller cannot bid on their own auction');
                require(msg.value >= startingPrice, 'Bid must be greater than or equal to starting price');
                require(msg.value > highestBid, 'Bid must be greater than current highest bid');
                require(highestBidder != msg.sender, 'Bidder is already highest bidder');

                if (highestBid != 0) {
                        pendingReturns[highestBidder] += highestBid;
                }

                highestBid = msg.value;
                highestBidder = payable(msg.sender);

                emit Bid(msg.sender, msg.value, address(this));
        }

        function endAuction(uint256 tokenId) public nonReentrant {
                require(msg.sender == seller, 'Only NFT owner can end auction');

                (uint256 royaltyPercentage, address payable originalOwner) = marketplaceContract.getRoyaltyData(tokenId);

                // Make fund transfer and initiate NFT transfer if a bid was made
                if (highestBidder != address(0)) {
                        // Calculate sale allocations
                        uint256 royaltyAmount = (highestBid * royaltyPercentage) / 100;
                        uint256 sellerAmount = highestBid - royaltyAmount;
                        uint256 marketplaceFee = (highestBid * 2) / 100;

                        // Send sale amount to seller
                        (bool sellerAmountSent, ) = payable(seller).call{value: sellerAmount}("");
                        require(sellerAmountSent, "Failed to send Ether to the seller");

                        // Send royalty amount to original nft owner
                        (bool royaltiesSent, ) = payable(originalOwner).call{value: royaltyAmount}("");
                        require(royaltiesSent, "Failed to send royalties to original owner");

                        // Send marketplace fee to marketplace contract
                        (bool feesSent, ) = payable(marketplaceAddress).call{value: marketplaceFee}("");
                        require(feesSent, "Failed to send fees to marketplace contract");

                        marketplaceContract.handleAuctionEnd(tokenId, highestBidder);
                } else {
                        marketplaceContract.handleAuctionEnd(tokenId, seller);
                }

                emit AuctionEnded(address(this), block.timestamp, nftId, seller, startingPrice, highestBid);
        }
}