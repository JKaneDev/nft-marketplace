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

	describe('Creating NFTs and modifying properties', () => {
		it('Should update listingPrice', async () => {
			await marketplace.updateListingPrice(100, { from: deployer });
			const listingPrice = await marketplace.listingPrice();
			expect(listingPrice.toString()).to.equal('100');
		});

		it('should create a market item', async () => {
			const tokenId = 1;
			const royaltyPercentage = ethers.parseEther('10');
			const price = ethers.parseEther('1');
			const listingPrice = ethers.parseEther('0.0025');
			const marketplaceAddress = await marketplace.getAddress();

			const tx = await marketplace
				.connect(account1)
				.createToken(tokenId, royaltyPercentage, price, { value: listingPrice });

			const receipt = await tx.wait();
			const marketItemCreatedLog = receipt.logs.find(
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
	});
});
