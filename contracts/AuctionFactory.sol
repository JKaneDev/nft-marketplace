// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import './Auction.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IMarketplace.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AuctionFactory {
        using Counters for Counters.Counter;

        Counters.Counter private _totalAuctions;
        Counters.Counter private _endedAuctions;

        uint256[] private _activeAuctionIds;

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
                bool active;
        }

        function createAuction(uint256 startingPrice, uint256 auctionDuration, uint256 nftId, address seller) public {
                require(seller != address(0), 'Invalid seller address');
                require(startingPrice > 0, 'Starting price must be at least 1 wei');
                require(auctions[nftId].seller == address(0), 'Auction for this nft already exists');

                uint256 currentTimestamp = block.timestamp;

                Auction newAuction = new Auction(nftId, startingPrice, seller, marketplaceAddress, address(this));

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
                marketplaceContract.resellMarketItem(nftId, startingPrice);

                _totalAuctions.increment();
                _activeAuctionIds.push(nftId);

                emit AuctionCreated(nftId, startingPrice, currentTimestamp, auctionDuration, seller, address(newAuction));
        }

        function changeActiveStatus (uint256 nftId) public {
                auctions[nftId].active = false;
                removeActiveAuction(nftId);
                _endedAuctions.increment();
        }

        function removeActiveAuction(uint256 nftId) internal {
                for (uint256 i = 0; i < _activeAuctionIds.length; i++) {
                        if (_activeAuctionIds[i] == nftId) {
                                _activeAuctionIds[i] = _activeAuctionIds[_activeAuctionIds.length - 1];
                                _activeAuctionIds.pop();
                                break;
                        }
                }
        }

        function getActiveAuctionIds() public view returns (uint256[] memory) {
                return _activeAuctionIds;
        }
}