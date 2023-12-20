// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IMarketplace.sol";
import './AuctionFactory.sol';
import "hardhat/console.sol";

contract Auction is ReentrancyGuard {

        uint256 public nftId;
        address public marketplaceAddress;
        IMarketplace marketplaceContract;
        AuctionFactory private auctionFactory;
        address payable public seller;
        uint256 public startingPrice;
        address payable public highestBidder;
        address payable penultimateBidder;
        uint256 public highestBid;
        bool ended;


        mapping(address => uint256) public pendingReturns;

        event Bid(address bidder, uint256 bidAmount, address auctionAddress);
        event AuctionEnded(uint256 nftId, address highestBidder, address seller, address nullAddress, uint256 highestBid);

        constructor(uint256 _nftId, uint256 _startingPrice, address _seller, address _marketplaceAddress, address _auctionFactoryAddress) {
                marketplaceAddress = _marketplaceAddress;
                marketplaceContract = IMarketplace(marketplaceAddress);
                auctionFactory = AuctionFactory(_auctionFactoryAddress);
                nftId = _nftId;
                seller = payable(_seller);
                startingPrice = _startingPrice;
        }

        function getHighestBidder() public view returns (address) {
                return highestBidder;
        }

        function withdraw() public returns (bool) {
                require(ended == true, 'User can only withdraw funds after auction has ended');
                require(msg.sender != highestBidder, 'highestBidder cannot withdraw funds');

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
                require(highestBidder != msg.sender, 'Bidder is already highest bidder');

                // Update the penultimate bidder
                penultimateBidder = highestBidder;

                uint256 refundAmount = pendingReturns[msg.sender];

                if (refundAmount > 0) {
                        // Reset the pending return before sending to prevent re-entrancy attacks
                        pendingReturns[msg.sender] = 0;

                        // Send back the previous bid to the current bidder
                        (bool refunded, ) = payable(msg.sender).call{value: refundAmount}("");
                        require(refunded, "Failed to refund previous bid");
                }

                require(msg.value > highestBid, 'Bid must be greater than current highest bid');

                address previousHighestBidder = highestBidder;
                uint256 previousHighestBid = highestBid;

                // Update the highest bid and bidder
                highestBid = msg.value;
                highestBidder = payable(msg.sender);

                // Add the previous highest bid to pending returns, if there was a previous bid
                if (previousHighestBidder != address(0)) {
                    pendingReturns[previousHighestBidder] += previousHighestBid;
                }

                emit Bid(msg.sender, msg.value, address(this));
        }

        function endAuction(uint256 tokenId) public nonReentrant {
                require(msg.sender == seller || msg.sender == marketplaceAddress, 'Only NFT owner or marketplace can end auction');

                (uint256 royaltyPercentage, address payable originalOwner) = marketplaceContract.getRoyaltyData(tokenId);

                // Make fund transfer and initiate NFT transfer if a bid was made
                if (highestBidder != address(0)) {
                        // Calculate sale allocations
                        uint256 royaltyAmount = (highestBid * royaltyPercentage) / 100;
                        uint256 marketplaceFee = (highestBid * 2) / 100;
                        uint256 sellerAmount = highestBid - royaltyAmount - marketplaceFee;

                        // Send sale amount to seller
                        (bool sellerAmountSent, ) = payable(seller).call{value: sellerAmount}("");
                        require(sellerAmountSent, "Failed to send Ether to the seller");

                        // Send royalty amount to original nft owner
                        (bool royaltiesSent, ) = payable(originalOwner).call{value: royaltyAmount}("");
                        require(royaltiesSent, "Failed to send royalties to original owner");

                        // Send marketplace fee to marketplace contract
                        (bool feesSent, ) = payable(marketplaceAddress).call{value: marketplaceFee}("");
                        require(feesSent, "Failed to send fees to marketplace contract");

                        // Refund to penultimate bidder
                        if (penultimateBidder != address(0) && pendingReturns[penultimateBidder] > 0) {
                                uint256 refundAmount = pendingReturns[penultimateBidder];
                                pendingReturns[penultimateBidder] = 0;

                                (bool sent, ) = penultimateBidder.call{value: refundAmount}("");
                                require(sent, "Failed to send refund to the penultimate bidder");
                        }

                        marketplaceContract.handleAuctionEnd(tokenId, highestBidder);

                        auctionFactory.changeActiveStatus(tokenId);
                } else {
                        marketplaceContract.handleAuctionEnd(tokenId, seller);
                }

                emit AuctionEnded(nftId, highestBidder, seller, address(0), highestBid);
        }
}