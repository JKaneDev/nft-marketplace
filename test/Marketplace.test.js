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

		it.only('should fetch the seller address', async () => {
			const seller = await marketplace.connect(account1).getSellerAddress(tokenId);
			expect(seller).to.equal(account1.address);
		});
	});
});
