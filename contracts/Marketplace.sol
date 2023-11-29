// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract Marketplace is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.0025 ether;

    address payable owner;
    
    mapping (uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event MarketItemCreated (
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    modifier onlyOwner() {
        require (msg.sender == owner, "only owner of the contract can update the listing price");
        _;
    }

    constructor() ERC721("NFT Metaverse Token", "MYNFT") {
        owner = payable(msg.sender);
    }

    function updateListingPrice(uint256 _listingPrice) public payable onlyOwner {
        listingPrice = _listingPrice;
    }

    function createToken(string memory tokenURI, uint256 price) public payable returns (uint256) {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createMarketItem(newTokenId, price);

        return newTokenId;
    }

    function createMarketItem(uint256 tokenId, uint256 price) public payable {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be paid in full");
        
        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    function resellMarketItem(uint256 tokenId, uint256 price) public payable {
        require(idToMarketItem[tokenId].owner == msg.sender, "token can only be resold by owner");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));

        _itemsSold.decrement();

        _transfer(msg.sender, address(this), tokenId);
    }

    function createMarketSale(uint256 tokenId) public payable {
        uint256 price = idToMarketItem[tokenId].price;

        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;

        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);

        payable(owner).transfer(listingPrice);
        payable(idToMarketItem[tokenId].seller).transfer(msg.value);

    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                uint256 currentId = i + 1;

                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Fetch all my NFTs
    function fetchMyNFT() public view returns(MarketItem[] memory) {
        uint256 totalCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // Get total count of my NFTs
        for (uint256 i = 0; i < totalCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;  
            }
        }

        // Initialize array to store my NFTs for return
        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalCount; i++) {

            // Check all unsold items for ownership
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;

                // Add all my NFTs to items array
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    // Fetch NFTs for individual user
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // Get total count for user's NFTs
        for (uint256 i = 0; i < totalCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        // Create array to store user's NFTs
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalCount; i++) {
            // Check NFTs for ownership
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;

                // Extract NFTs and add to items array
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

}

// So I have this skeleton endAuction function:

// function endAuction() public {
//                 require(msg.sender == seller, 'Only NFT owner can end auction');

//                 // transfer highest bid to the seller
//                 // transfer royalties to the original owner
//                 // transfer nft from seller to highestBidder
//                 // emit auction ended event
//         }

// My question is about the royalties. The original owner defines the royalties when the NFT is first minted. This is stored in the NFTs metadata which is stored on IPFS. If this is the first time the NFT is being sold the seller be the same as the royalty receiver - so they will receive both the amount from the sale plus the deducted royalties. If the seller is different from the original owner, 