// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import './Auction.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IMarketplace.sol";

contract AuctionFactory {

        address payable owner;
        address marketplaceAddress;
        IMarketplace marketplaceContract;

        constructor(address _marketplaceAddress) {
                owner = payable(msg.sender);
                marketplaceAddress = _marketplaceAddress;
                marketplaceContract = IMarketplace(_marketplaceAddress);
        }

        mapping (uint256 => AuctionItem) public auctions;

        event AuctionCreated(uint256 nftId, uint256 startingPrice, uint256 startTime, uint256 auctionDuration, address seller, address auctionAddress);

        struct AuctionItem {
                address auctionAddress;
                uint256 nftId;
                uint256 startingPrice;
                uint256 startTime;
                uint256 auctionDuration;
                address seller;
        }

        function createAuction(uint256 startingPrice, uint256 auctionDuration, uint256 nftId, address seller) public {
                require(seller != address(0), 'Invalid seller address');
                require(startingPrice > 0, 'Starting price must be at least 1 wei');
                require(auctions[nftId].seller == address(0), 'Auction for this nft already exists');

                uint256 currentTimestamp = block.timestamp;

                Auction newAuction = new Auction(nftId, startingPrice, seller, marketplaceAddress);

                auctions[nftId] = AuctionItem(
                        address(newAuction), 
                        nftId,
                        startingPrice,
                        block.timestamp,
                        auctionDuration,
                        seller
                );

                // Transfer the NFT from the seller to escrow in the marketplace contract
                marketplaceContract.resellMarketItem(nftId, startingPrice);

                emit AuctionCreated(nftId, startingPrice, currentTimestamp, auctionDuration, seller, address(newAuction));
        }
}