import { ethers } from 'ethers';
import { connectSuccess, connectFailure } from './connectSlices';
import { setContract, unsetContract, setError } from './marketplaceSlices';
import Marketplace from '../abis/contracts/Marketplace.sol/Marketplace.json';

export const connectToEthereum = async (dispatch) => {
	try {
		if (typeof window.ethereum !== 'undefined') {
			// Connect to Hardhat Local Network + Fetch 1st account
			const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
			const signer = provider.getSigner();
			const accounts = await provider.listAccounts();
			const account = accounts[0];

			// Request account access
			// const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			// const provider = new ethers.providers.Web3Provider(window.ethereum);
			// const signer = provider.getSigner();

			// Dispatch successful connect to redux
			dispatch(connectSuccess({ account, provider, signer }));
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
