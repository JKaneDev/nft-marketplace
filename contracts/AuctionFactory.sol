// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import './Auction.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IMarketplace.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract AuctionFactory {
        using Counters for Counters.Counter;

        Counters.Counter private _totalAuctions;
        Counters.Counter private _endedAuctions;

        uint256[] public _activeAuctionIds;

        address payable public owner;
        address public marketplaceAddress;
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
                bool active;
        }

        /**
         * @dev Creates a new auction for an NFT.
         * @param startingPrice The starting price of the auction.
         * @param auctionDuration The duration of the auction in seconds.
         * @param nftId The ID of the NFT being auctioned.
         * @param seller The address of the seller.
         **/
        function createAuction(uint256 startingPrice, uint256 auctionDuration, uint256 nftId, address seller) public {
                require(seller != address(0), 'Invalid seller address');
                console.log('Seller: ', seller);
                require(startingPrice > 0, 'Starting price must be at least 1 wei');
                console.log('Starting price: ', startingPrice);

                uint256 currentTimestamp = block.timestamp;

                Auction newAuction = new Auction(nftId, startingPrice, auctionDuration, seller, marketplaceAddress, address(this));

                auctions[nftId] = AuctionItem(
                        address(newAuction), 
                        nftId,
                        startingPrice,
                        block.timestamp,
                        auctionDuration,
                        seller,
                        true
                );

                // Transfer the NFT from the seller to escrow in the marketplace contract
                marketplaceContract.resellMarketItem(nftId, startingPrice, seller);

                _totalAuctions.increment();
                _activeAuctionIds.push(nftId);

                emit AuctionCreated(nftId, startingPrice, currentTimestamp, auctionDuration, seller, address(newAuction));
        }

        /**
         * @dev Changes the active status of an auction for a specific NFT.
         * @param nftId The ID of the NFT.
         */
        function changeActiveStatus(uint256 nftId) public {
                auctions[nftId].active = false;
                removeActiveAuction(nftId);
                _endedAuctions.increment();
        }

        /**
         * @dev Removes an active auction for a specific NFT.
         * @param nftId The ID of the NFT for which the auction is to be removed.
         */
        function removeActiveAuction(uint256 nftId) internal {
                for (uint256 i = 0; i < _activeAuctionIds.length; i++) {
                        if (_activeAuctionIds[i] == nftId) {
                                _activeAuctionIds[i] = _activeAuctionIds[_activeAuctionIds.length - 1];
                                _activeAuctionIds.pop();
                                break;
                        }
                }
        }

        /**
         * @dev Returns an array of active auction IDs.
         * @return array of uint256 representing the active auction IDs.
         */
        function getActiveAuctionIds() public view returns (uint256[] memory) {
                return _activeAuctionIds;
        }
}