import { ethers } from 'ethers';
import { connectSuccess, connectFailure } from './connectSlices';
import { setContract, unsetContract, setError } from './marketplaceSlices';
import Marketplace from '../abis/contracts/Marketplace.sol/Marketplace.json';

export const connectToEthereum = async (dispatch) => {
	try {
		if (typeof window.ethereum !== 'undefined') {
			// Request account access
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

			console.log('Accounts: ', accounts);

			const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');

			console.log('Provider instantiated: ', provider);

			const signer = await provider.getSigner();

			console.log('Hardhat network connection success: ', signer);

			// Dispatch successful connect to redux
			dispatch(connectSuccess({ account: accounts[0] }));

			return signer.getAddress();
		} else {
			// Prompt metamask installation
			window.alert('Please install MetaMask');
			dispatch(connectFailure('MetaMask not installed'));
		}
	} catch (error) {
		console.error('Error connecting to MetaMask');
		dispatch(connectFailure(error.message));
	}
};

export const loadMarketplaceContract = async (dispatch) => {
	const abi = Marketplace.abi;
	const address = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

	try {
		const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
		const signer = await provider.getSigner();
		const marketplace = new ethers.Contract(address, abi, signer);

		// Dispatch successful contract  creation
		dispatch(setContract({ address, abi }));

		return marketplace;
	} catch (error) {
		console.log('Marketplace contract not deployed to the current network. Please select another with MetaMask.');
	}
};
