// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import './Auction.sol';

contract AuctionFactory {

        address payable owner;

        constructor() {
                owner = payable(msg.sender);
        }

        mapping (uint256 => AuctionItem) private auctions;

        event AuctionCreated(uint256 nftId, uint256 startingPrice, uint256 startTime, uint256 auctionDuration, address seller, address auctionAddress);

        struct AuctionItem {
                uint256 nftId;
                uint256 startingPrice;
                uint256 startTime;
                uint256 auctionDuration;
                address seller;
                bool auctionActive;
        }

        function createContract(uint256 startingPrice, uint256 auctionDuration, uint256 nftId, address seller) public {
                require(seller != address(0), 'Invalid seller address');
                require(startingPrice > 0, 'Starting price must be at least 1 wei');
                require(auctions[nftId].seller == address(0), 'Auction for this nft already exists');

                uint256 currentTimestamp = block.timestamp;

                Auction newAuction = new Auction(nftId, startingPrice, currentTimestamp, auctionDuration, seller);

                auctions[nftId] = AuctionItem(
                        nftId,
                        startingPrice,
                        block.timestamp,
                        auctionDuration,
                        seller,
                        true
                );

                emit AuctionCreated(nftId, startingPrice, currentTimestamp, auctionDuration, seller, address(newAuction);
        }
}