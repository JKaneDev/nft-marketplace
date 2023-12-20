const AuctionFactory = require('../abis/contracts/AuctionFactory.sol/AuctionFactory.json');
const Marketplace = require('../abis/contracts/Marketplace.sol/Marketplace.json');
const { expect } = require('chai');

describe('AuctionFactory', () => {
	let marketplace;
	let marketplaceAddress;
	let factory;
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
		marketplaceAddress = marketplace.getAddress();
		factory = await AuctionFactory.deploy(marketplaceAddress);
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
});
