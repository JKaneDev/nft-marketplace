const { ethers } = require('ethers');
const Marketplace = require('../abis/contracts/Marketplace.sol/Marketplace.json');

async function main() {
	const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
	const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

	const marketplace = new ethers.ContractFactory(Marketplace.abi, Marketplace.bytecode, wallet);
	const contract = await marketplace.deploy();
	await contract.waitForDeployment();

	console.log(`Contract deployed to address: ${await contract.getAddress()}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
