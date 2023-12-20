const Marketplace = require('../abis/contracts/Marketplace.sol/Marketplace.json');
const { expect } = require('chai');

describe('Marketplace', () => {
	let marketplace;
	let accounts;
	let deployer;
	let account1;
	let account2;

	beforeEach(async () => {
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		account1 = accounts[1];
		account2 = accounts[2];

		const Marketplace = await ethers.getContractFactory('Marketplace');
		marketplace = await Marketplace.deploy();
	});

	describe('Deployment', () => {
		it('Should deploy smart contract properly', async () => {
			const address = await marketplace.getAddress();
			expect(address).to.not.equal(null);
			expect(address).to.not.equal('');
			expect(address).to.not.equal(0x0);
			expect(address).to.not.equal(undefined);
		});
	});

	describe('Creating, Transacting & Modifying NFTs', () => {
		let receipt;
		let tokenId;
		let royaltyPercentage;
		let price;
		let listingPrice;
		let marketplaceAddress;

		beforeEach(async () => {
			tokenId = 1;
			royaltyPercentage = ethers.parseEther('10');
			price = ethers.parseEther('1');
			listingPrice = ethers.parseEther('0.0025');
			marketplaceAddress = await marketplace.getAddress();

			const tx = await marketplace
				.connect(account1)
				.createToken(tokenId, royaltyPercentage, price, { value: listingPrice });

			receipt = await tx.wait();
		});

		it('Should update listingPrice', async () => {
			await marketplace.updateListingPrice(100, { from: deployer });
			const listingPrice = await marketplace.listingPrice();
			expect(listingPrice.toString()).to.equal('100');
		});

		it('should create a market item', async () => {
			marketItemCreatedLog = receipt.logs.find(
				(log) =>
					log.topics[0] ===
					ethers.id('MarketItemCreated(uint256,address,address,address,uint256,uint256,bool)'),
			);
			const contractInterface = new ethers.Interface(Marketplace.abi);
			const parsedLog = contractInterface.parseLog(marketItemCreatedLog);

			expect(parsedLog.args[0]).to.equal(tokenId);
			expect(parsedLog.args[1]).to.equal(account1.address);
			expect(parsedLog.args[2]).to.equal(account1.address);
			expect(parsedLog.args[3]).to.equal(marketplaceAddress);
			expect(parsedLog.args[4]).to.equal(royaltyPercentage);
			expect(parsedLog.args[5]).to.equal(price);
			expect(parsedLog.args[6]).to.be.false;
		});

		it('should allow seller to delist NFT', async () => {
			await marketplace.connect(account1).delistMarketItem(tokenId);
			const items = await marketplace.connect(account1).fetchMyNFT();
			expect(items.length).to.equal(1);
		});

		it('should allow user to fetch royalty data', async () => {
			const royaltyData = await marketplace.connect(account1).getRoyaltyData(tokenId);
			expect(royaltyData[0]).to.equal(royaltyPercentage);
			expect(royaltyData[1]).to.equal(account1.address);
		});

		it('should allow user to get nft price', async () => {
			const price = await marketplace.connect(account1).getNFTPrice(tokenId);
			expect(price).to.equal(price);
		});

		it('should fetch the seller address', async () => {
			const seller = await marketplace.connect(account1).getSellerAddress(tokenId);
			expect(seller).to.equal(account1.address);
		});

		it('should allow the user to update the nft price', async () => {
			await marketplace.connect(account1).updateNFTPrice(tokenId, ethers.parseEther('2'));
			const price = await marketplace.connect(account1).getNFTPrice(tokenId);
			expect(price).to.equal(ethers.parseEther('2'));
		});

		it('should disallow other users to update the users nft price', async () => {
			await expect(
				marketplace.connect(account2).updateNFTPrice(tokenId, ethers.parseEther('2')),
			).to.be.revertedWith('Caller is not the owner');
		});

		it('should disallow the user from updating the price with 0', async () => {
			await expect(marketplace.connect(account1).updateNFTPrice(tokenId, ethers.parseEther('0'))).to
				.be.reverted;
		});

		it('should allow the user to relist their nft on the marketplace', async () => {
			await marketplace.connect(account1).delistMarketItem(tokenId);
			await marketplace
				.connect(account1)
				.resellMarketItem(tokenId, ethers.parseEther('2'), account1.address);
			const price = await marketplace.connect(account1).getNFTPrice(tokenId);
			const items = await marketplace.connect(account1).fetchMyNFT();
			const marketItems = await marketplace.fetchMarketItems();
			expect(marketItems.length).to.equal(1);
			expect(marketItems[0].sold).to.equal(false);
			expect(marketItems[0].owner).to.equal(marketplaceAddress);
			expect(price).to.equal(ethers.parseEther('2'));
			expect(items.length).to.equal(0);
		});

		it('should disallow unauthorized users to relist nft', async () => {
			await marketplace.connect(account1).delistMarketItem(tokenId);
			const marketItems = await marketplace.fetchMarketItems();
			expect(marketItems.length).to.equal(0);
			await expect(
				marketplace
					.connect(account2)
					.resellMarketItem(tokenId, ethers.parseEther('2'), account1.address),
			).to.be.revertedWith('Only owner can relist NFT');
		});

		it('should allow another user to purchase an nft', async () => {
			await marketplace
				.connect(account2)
				.createMarketSale(tokenId, { value: ethers.parseEther('1') });
			const account1Items = await marketplace.connect(account1).fetchMyNFT();
			const account2Items = await marketplace.connect(account2).fetchMyNFT();
			const marketItems = await marketplace.fetchMarketItems();
			expect(marketItems.length).to.equal(0);
			expect(account1Items.length).to.equal(0);
			expect(account2Items.length).to.equal(1);
			expect(account2Items[0].tokenId).to.equal(tokenId);
			expect(account2Items[0].sold).to.equal(true);
			expect(account2Items[0].owner).to.equal(account2.address);
		});

		it('should disallow users from purchasing their own NFTs', async () => {
			await expect(
				marketplace.connect(account1).createMarketSale(tokenId, { value: ethers.parseEther('1') }),
			).to.be.revertedWith('User cannot purchase their own NFT');
		});

		it.only('should disallow sales that do not send the required amount of ether', async () => {
			await expect(
				marketplace
					.connect(account2)
					.createMarketSale(tokenId, { value: ethers.parseEther('0.5') }),
			).to.be.revertedWith('Please submit the asking price in order to complete the purchase');
		});
	});
});
