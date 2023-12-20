const AuctionFactory = require('../abis/contracts/AuctionFactory.sol/AuctionFactory.json');
const Marketplace = require('../abis/contracts/Marketplace.sol/Marketplace.json');
const { expect } = require('chai');

describe('AuctionFactory', () => {
	let marketplace;
	let marketplaceAddress;
	let factory;
	let factoryAddress;
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
		const AuctionFactory = await ethers.getContractFactory('AuctionFactory');
		marketplace = await Marketplace.deploy();
		marketplaceAddress = await marketplace.getAddress();
		factory = await AuctionFactory.deploy(marketplaceAddress);
		factoryAddress = await factory.getAddress();
		await marketplace.setAuctionFactoryAddress(factoryAddress);
	});

	describe('Deployment', () => {
		it('Should deploy smart contract properly', async () => {
			const address = await factory.getAddress();
			expect(address).to.not.equal(null);
			expect(address).to.not.equal('');
			expect(address).to.not.equal(0x0);
			expect(address).to.not.equal(undefined);
		});
	});

	describe('Assigning constructor variables', () => {
		it('Should assign marketplaceAddress', async () => {
			const address = await factory.marketplaceAddress();
			expect(address).to.equal(marketplaceAddress);
		});

		it('Should assign deployer as owner', async () => {
			const owner = await factory.owner();
			expect(owner).to.equal(deployer.address);
		});
	});

	describe('Creating, Bidding & Ending Auctions', () => {
		let tokenId;
		let startingPrice;
		let duration;

		beforeEach(async () => {
			tokenId = 1;
			startingPrice = ethers.parseEther('1.5');
			duration = 3600; // 1 hour in seconds

			await marketplace
				.connect(account1)
				.createToken(1, ethers.parseEther('10'), ethers.parseEther('1'), {
					value: ethers.parseEther('0.0025'),
				});
			await marketplace.connect(account1).delistMarketItem(1);
		});

		it('should emit AuctionCreated event when creating an auction', async () => {
			const tx = await factory
				.connect(account1)
				.createAuction(startingPrice, duration, tokenId, account1.address);

			const receipt = await tx.wait();

			const iface = new ethers.Interface(AuctionFactory.abi);
			const events = receipt.logs.map((log) => iface.parseLog(log)).filter((log) => log != null);

			const event = events.find((event) => event.name === 'AuctionCreated');

			expect(event).to.not.be.undefined;
			expect(event.args[0]).to.equal(tokenId);
			expect(event.args[1]).to.equal(startingPrice);
			expect(event.args[3]).to.equal(duration);
			expect(event.args[4]).to.equal(account1.address);
		});
	});
});
