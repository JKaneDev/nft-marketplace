const { ethers } = require('hardhat');
const Marketplace = require('../abis/contracts/Marketplace.sol/Marketplace.json');
const AuctionFactory = require('../abis/contracts/AuctionFactory.sol/AuctionFactory.json');

async function main() {
	const [deployer] = await ethers.getSigners();
	console.log('Deploying contracts with the account:', deployer.address);

	console.log('Deployment costs: ', ethers.formatEther('483932874016889700'));

	const MarketplaceContract = await ethers.getContractFactory('Marketplace');
	const marketplace = await MarketplaceContract.deploy();
	await marketplace.waitForDeployment();

	const marketplaceAddress = await marketplace.getAddress();

	const AuctionFactoryContract = await ethers.getContractFactory('AuctionFactory');
	const auctionFactory = await AuctionFactoryContract.deploy(marketplaceAddress);
	await auctionFactory.waitForDeployment();

	const auctionFactoryAddress = await auctionFactory.getAddress();

	await marketplace.setAuctionFactoryAddress(auctionFactoryAddress);

	console.log(`marketplaceContract deployed to address: ${await marketplace.getAddress()}`);
	console.log(`auctionFactoryContract deployed to address: ${await auctionFactory.getAddress()}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
