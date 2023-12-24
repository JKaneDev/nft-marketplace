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

    function setAuctionFactoryAddress(address auctionFactoryAddress) public {
        auctionFactory = auctionFactoryAddress;
    }

    /**
     * @dev Updates the listing price for creating a new listing in the marketplace.
     * @param _listingPrice The new listing price to be set.
     * @notice Only the contract owner can update the listing price.
     */
    function updateListingPrice(uint256 _listingPrice) public payable onlyOwner {
        listingPrice = _listingPrice;
    }

    /**
     * @dev Retrieves the price of an NFT based on its token ID.
     * @param tokenId The ID of the NFT.
     * @return price The price of the NFT.
     **/
    function getNFTPrice(uint256 tokenId) public view returns (uint256 price) {
        MarketItem memory item = idToMarketItem[tokenId];
        return item.price;
    }

    /**
     * @dev Retrieves the royalty data for a given token ID.
     * @param tokenId The ID of the token.
     * @return royaltyPercentage and the original owner's address.
     */
    function getRoyaltyData(uint256 tokenId) external view override returns (uint256, address payable) {
        MarketItem memory nft = idToMarketItem[tokenId];
        return (nft.royaltyPercentage, nft.originalOwner);
    }

    /**
     * @dev Retrieves the address of the seller for a given token ID.
     * @param tokenId The ID of the token.
     * @return The address of the seller.
     */
    function getSellerAddress(uint256 tokenId) public view returns (address) {
        return idToMarketItem[tokenId].seller;
    }

    /**
     * @dev Updates the price of an NFT in the marketplace.
     * @param tokenId The ID of the NFT.
     * @param price The new price for the NFT.
     * Requirements:
     * - The NFT must exist in the marketplace.
     * - The caller must be the owner of the NFT.
     * - The price must be greater than zero.
     */
    function updateNFTPrice(uint256 tokenId, uint256 price) public {
        require(idToMarketItem[tokenId].owner != address(0), "NFT does not exist in marketplace");
        require(idToMarketItem[tokenId].seller == msg.sender, "Caller is not the owner");
        require(price > 0, "Price must be greater than zero");

        // Update the price
        idToMarketItem[tokenId].price = price;
    }

    /**
     * @dev Creates a new token with the given token URI, royalty percentage, and price.
     * @param tokenURI The URI of the token metadata.
     * @param royaltyPercentage The percentage of royalty to be paid to the token creator.
     * @param price The price of the token in wei.
     * @return newTokenId of the newly created token.
     */
    function createToken(string memory tokenURI, uint256 royaltyPercentage, uint256 price) public payable returns (uint256) {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createMarketItem(newTokenId, royaltyPercentage, price);

        return newTokenId;
    }

    /**
     * @dev Creates a new market item for a given token.
     * @param tokenId The ID of the token to create a market item for.
     * @param royaltyPercentage The percentage of royalty to be paid to the original owner of the token.
     * @param price The price of the market item.
     * @notice The price must be greater than 0 and must be paid in full.
     * @notice The function transfers the token to the marketplace contract.
     * @notice Emits a `MarketItemCreated` event.
     */
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

    /**
     * @dev Resells a market item by updating its price, seller, and ownership.
     * Only the owner of the NFT or the auction factory can relist the NFT.
     * If the item was previously sold, the count of sold items is decremented.
     * The NFT is transferred from the seller to the marketplace contract.
     * @param tokenId The ID of the NFT being resold.
     * @param price The new price of the NFT.
     * @param seller The address of the seller.
     */
    function resellMarketItem(uint256 tokenId, uint256 price, address seller) external payable override {
        require(idToMarketItem[tokenId].owner == msg.sender || msg.sender == auctionFactory, "Only owner can relist NFT");

        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(seller);
        idToMarketItem[tokenId].owner = payable(address(this));

        if (_itemsSold.current() > 0) {
            _itemsSold.decrement();
        }

        _transfer(seller, address(this), tokenId);
    }

    /**
     * @dev Allows the seller to delist a market item.
     * @param tokenId The ID of the token to be delisted.
     * @notice Only the token seller can delist the item.
     * @notice The NFT will be transferred back to the seller.
     * @notice The market item will be marked as sold.
     */
    function delistMarketItem(uint256 tokenId) public {
        require(msg.sender == idToMarketItem[tokenId].seller, 'Only token seller can delist');

        // Transfer the NFT back to the seller
        _transfer(address(this), msg.sender, tokenId);

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;

        _itemsSold.increment();
    }

    /**
     * @dev Creates a market sale for a given token ID.
     * @param tokenId The ID of the token being sold.
     * @notice The seller cannot purchase their own NFT.
     * @notice The ownership of the token is transferred to the buyer upon successful purchase.
     * @notice The listing price is transferred to the contract owner as a fee.
     * @notice The purchase price is transferred to the seller.
     * @notice This function increments the count of items sold.
     * @notice This function requires the caller to send the exact asking price in Ether.
     * @notice Reverts if the caller does not send the correct amount of Ether.
     */
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

    /**
     * @dev Fetches all the unsold market items from the marketplace.
     * @return MarketItem structs array representing the unsold items.
     **/
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

    /**
     * @dev Fetches the NFTs owned by the caller.
     * @return MarketItem structs array representing the caller's NFTs.
     **/
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

    /**
     * @dev Fetches the list of items listed by the user.
     * @return MarketItem structs array representing the user's listed items.
     **/
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

    

    /**
     * @dev Gives approval to another address to transfer the specified token.
     * Only the owner of the token can give approval.
     * @param approvee The address to be approved for token transfer.
     * @param tokenId The ID of the token to be approved for transfer.
     */
    function giveApproval(address approvee, uint256 tokenId) external {
        require(msg.sender == ownerOf(tokenId), 'Only the owner can give approval');
        approve(approvee, tokenId);
    }

    /**
     * @dev Revoke the approval for a specific token.
     * Only the owner of the token can revoke the approval.
     * @param tokenId The ID of the token to revoke approval for.
     */
    function revokeApproval(uint256 tokenId) external override {
        require(msg.sender == ownerOf(tokenId), 'Only the owner can revoke approval');
        approve(address(0), tokenId);
    }

    /**
     * @dev Allows the marketplace to handle the end of an auction by transferring 
     * the NFT to the winner and updating the market item status.
     * @param tokenId The ID of the NFT being auctioned.
     * @param winner The address of the winner who will receive the NFT.
     */
    function handleAuctionEnd(uint256 tokenId, address winner) external override {
        // Transfer NFT to intended recipient
        IERC721(address(this)).safeTransferFrom(address(this), winner, tokenId);

        _itemsSold.increment();

        idToMarketItem[tokenId].owner = payable(winner);
        idToMarketItem[tokenId].sold = true;

        emit NFTTransferred(tokenId, winner);
    }
}