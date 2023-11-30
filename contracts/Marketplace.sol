// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IMarketplace.sol";
import "hardhat/console.sol";

contract Marketplace is ERC721URIStorage, ReentrancyGuard, IMarketplace {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.0025 ether;

    address payable owner;
    
    mapping (uint256 => MarketItem) private idToMarketItem;

    event NFTTransferred(uint256 nftId, address auctionWinner);
    event FundsWithdrawn(uint256 amount, address targetWallet);

    struct MarketItem {
        uint256 tokenId;
        address payable originalOwner;
        address payable seller;
        address payable owner;
        uint256 royaltyPercentage;
        uint256 price;
        bool sold;
    }

    event MarketItemCreated (
        uint256 indexed tokenId,
        address originalOwner,
        address seller,
        address owner,
        uint256 royaltyPercentage,
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

    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, 'No funds to withdraw');

        (bool sent, ) = payable(owner).call{value: balance}("");
        require(sent, 'Failed to withdraw funds');

        emit FundsWithdrawn(balance, msg.sender);
    }

    function updateListingPrice(uint256 _listingPrice) public payable onlyOwner {
        listingPrice = _listingPrice;
    }

    function getRoyaltyData(uint256 tokenId) external view override returns (uint256, address payable) {
        MarketItem memory nft = idToMarketItem[tokenId];
        return (nft.royaltyPercentage, nft.originalOwner);
    }

    function createToken(string memory tokenURI, uint256 royaltyPercentage, uint256 price) public payable returns (uint256) {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createMarketItem(newTokenId, royaltyPercentage, price);

        return newTokenId;
    }

    // NFT is held in escrow in the marketplace
    function createMarketItem(uint256 tokenId, uint256 royaltyPercentage, uint256 price) public payable {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be paid in full");
        
        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(msg.sender),
            payable(address(this)),
            royaltyPercentage,
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            msg.sender,
            address(0),
            royaltyPercentage,
            price,
            false
        );
    }

    // Allows the user to relist an item they own in the marketplace
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

    function handleAuctionEnd(uint256 tokenId, address winner) external override {
        // Transfer NFT to intended recipient
        IERC721(address(this)).safeTransferFrom(address(this), winner, tokenId);

        idToMarketItem[tokenId].owner = payable(winner);

        emit NFTTransferred(tokenId, winner);
    }
}

