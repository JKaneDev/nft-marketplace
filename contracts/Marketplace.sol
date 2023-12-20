// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IMarketplace.sol";
import "./Auction.sol";
import "hardhat/console.sol";

contract Marketplace is ERC721URIStorage, ReentrancyGuard, IMarketplace {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 public listingPrice = 0.0025 ether;

    address payable owner;
    address private auctionFactory;
    
    mapping (uint256 => MarketItem) private idToMarketItem;

    event NFTTransferred(uint256 nftId, address auctionWinner);

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

    receive() external payable {}
    
    fallback() external payable {}

    function updateListingPrice(uint256 _listingPrice) public payable onlyOwner {
        listingPrice = _listingPrice;
    }

    function getNFTPrice(uint256 tokenId) public view returns (uint256 price) {
        MarketItem memory item = idToMarketItem[tokenId];
        return item.price;
    }

    function getRoyaltyData(uint256 tokenId) external view override returns (uint256, address payable) {
        MarketItem memory nft = idToMarketItem[tokenId];
        return (nft.royaltyPercentage, nft.originalOwner);
    }

    function getSellerAddress(uint256 tokenId) public view returns (address) {
        return idToMarketItem[tokenId].seller;
    }

    function updateNFTPrice(uint256 tokenId, uint256 price) public {
        require(idToMarketItem[tokenId].owner != address(0), "NFT does not exist in marketplace");
        require(idToMarketItem[tokenId].seller == msg.sender, "Caller is not the owner");
        require(price > 0, "Price must be greater than zero");

        // Update the price
        idToMarketItem[tokenId].price = price;
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
            payable(msg.sender), // originalOwner
            payable(msg.sender), // seller 
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
            address(this),
            royaltyPercentage,
            price,
            false
        );
    }

    // Allows the user to relist an item they own in the marketplace
    function resellMarketItem(uint256 tokenId, uint256 price, address seller) external payable override {
        require(idToMarketItem[tokenId].owner == msg.sender || msg.sender == auctionFactory, "Only owner can relist NFT");

        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));

        if (_itemsSold.current() > 0) {
            _itemsSold.decrement();
        }

        _transfer(seller, address(this), tokenId);
    }

    function delistMarketItem(uint256 tokenId) public {
        require(msg.sender == idToMarketItem[tokenId].seller, 'Only token seller can delist');

        // Transfer the NFT back to the seller
        _transfer(address(this), msg.sender, tokenId);

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;

        _itemsSold.increment();
    }

    function createMarketSale(uint256 tokenId) public payable {
        uint256 price = idToMarketItem[tokenId].price;

        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        require(msg.sender != idToMarketItem[tokenId].seller, "User cannot purchase their own NFT");

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

    function setAuctionFactoryAddress(address auctionFactoryAddress) public {
        auctionFactory = auctionFactoryAddress;
    }

    function giveApproval(address approvee, uint256 tokenId) external {
        require(msg.sender == ownerOf(tokenId), 'Only the owner can give approval');
        approve(approvee, tokenId);
    }

    function revokeApproval(uint256 tokenId) external override {
        require(msg.sender == ownerOf(tokenId), 'Only the owner can revoke approval');
        approve(address(0), tokenId);
    }

    function handleAuctionEnd(uint256 tokenId, address winner) external override {
        // Transfer NFT to intended recipient
        IERC721(address(this)).safeTransferFrom(address(this), winner, tokenId);

        idToMarketItem[tokenId].owner = payable(winner);
        idToMarketItem[tokenId].sold = true;

        emit NFTTransferred(tokenId, winner);
    }

    function triggerEndAuction(address auctionContractAddress, uint256 tokenId) public {
        Auction auctionContract = Auction(auctionContractAddress);
        auctionContract.endAuction(tokenId);
    }
}