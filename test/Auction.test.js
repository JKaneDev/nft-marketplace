const { ethers } = require('hardhat');
const Auction = require('../abis/contracts/Auction.sol/Auction.json');
const AuctionFactory = require('../abis/contracts/AuctionFactory.sol/AuctionFactory.json');
const Marketplace = require('../abis/contracts/Marketplace.sol/Marketplace.json');
const { expect } = require('chai');

describe('AuctionFactory', () => {
	let auction;
	let auctionAddress;
	let marketplace;
	let marketplaceAddress;
	let factory;
	let factoryAddress;
	let accounts;
	let account1;
	let account2;
	let marketItemCreatedEvent;

	// Must deploy all app contracts before auction contract can be deployed
	beforeEach(async () => {
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		account1 = accounts[1];
		account2 = accounts[2];

		/*
                     Deploy contracts and fetch addresses for use in auction contract
                     constructor function
              */
		const MarketplaceInstance = await ethers.getContractFactory('Marketplace');
		const AuctionFactory = await ethers.getContractFactory('AuctionFactory');
		marketplace = await MarketplaceInstance.deploy();
		marketplaceAddress = await marketplace.getAddress();
		factory = await AuctionFactory.deploy(marketplaceAddress);
		factoryAddress = await factory.getAddress();

		/*
                     Mint NFT and create market item, then delist it so it can be listed
                     in auction.
              */
		const tx = await marketplace
			.connect(account1)
			.createToken(1, ethers.parseEther('10'), ethers.parseEther('1'), {
				value: ethers.parseEther('0.0025'),
			});

		const receipt = await tx.wait(); // wait for tx receipt before proceeding

		await marketplace.connect(account1).delistMarketItem(1);

		/*
                     Parse event logs to get token id and create auction contract
              */
		const iface = new ethers.Interface(Marketplace.abi);
		const events = receipt.logs.map((log) => iface.parseLog(log)).filter((log) => log != null);
		marketItemCreatedEvent = events.find((event) => event.name === 'MarketItemCreated');
	});

	describe('Deployment', () => {
		it('should deploy the auction contract', async () => {
			const Auction = await ethers.getContractFactory('Auction');
			// Create auction contract with data parsed from event logs
			auction = await Auction.deploy(
				marketItemCreatedEvent.args[0],
				ethers.parseEther('1.5'),
				account1.address,
				marketplaceAddress,
				factoryAddress,
			);
		});
	});

	describe('Contract state variable assignment', () => {
		beforeEach(async () => {
			const Auction = await ethers.getContractFactory('Auction');
			auction = await Auction.deploy(
				marketItemCreatedEvent.args[0],
				ethers.parseEther('1.5'),
				account1.address,
				marketplaceAddress,
				factoryAddress,
			);
		});

		it('should set nftId correctly', async () => {
			expect(await auction.nftId()).to.equal(marketItemCreatedEvent.args[0]);
		});

		it('should set startingPrice correctly', async () => {
			expect(await auction.startingPrice()).to.equal(ethers.parseEther('1.5'));
		});

		it('should set seller correctly', async () => {
			expect(await auction.seller()).to.equal(account1.address);
		});

		it('should set marketplaceAddress correctly', async () => {
			expect(await auction.marketplaceAddress()).to.equal(marketplaceAddress);
		});
	});

	describe('Bidding', () => {
		beforeEach(async () => {
			const Auction = await ethers.getContractFactory('Auction');
			auction = await Auction.deploy(
				marketItemCreatedEvent.args[0],
				ethers.parseEther('1.5'),
				account1.address,
				marketplaceAddress,
				factoryAddress,
			);
		});

		it.only('Should a user to bid on an auction', async () => {
			await auction.connect(account2).bid({ value: ethers.parseEther('2') });
			expect(await auction.highestBidder()).to.equal(account2.address);
			expect(await auction.highestBid()).to.equal(ethers.parseEther('1.5'));
		});
	});
});
