const { ethers } = require('ethers');
const Marketplace = require('../abis/contracts/Marketplace.sol/Marketplace.json');
const AuctionFactory = require('../abis/contracts/AuctionFactory.sol/AuctionFactory.json');

async function main() {
	const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
	const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

	const marketplace = new ethers.ContractFactory(Marketplace.abi, Marketplace.bytecode, wallet);
	const marketplaceContract = await marketplace.deploy();
	await marketplaceContract.waitForDeployment();

	const marketplaceAddress = await marketplaceContract.getAddress();

	const auctionFactory = new ethers.ContractFactory(AuctionFactory.abi, AuctionFactory.bytecode, wallet);
	const auctionFactoryContract = await auctionFactory.deploy(marketplaceAddress);
	await auctionFactoryContract.waitForDeployment();

	const auctionFactoryAddress = await auctionFactoryContract.getAddress();

	await marketplaceContract.setAuctionFactoryAddress(auctionFactoryAddress);

	console.log(`marketplaceContract deployed to address: ${await marketplaceContract.getAddress()}`);
	console.log(`auctionFactoryContract deployed to address: ${await auctionFactoryContract.getAddress()}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
