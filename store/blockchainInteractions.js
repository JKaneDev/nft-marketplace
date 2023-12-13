import { ethers } from 'ethers';
import { connectSuccess, connectFailure } from './connectSlices';
import { setError, setMarketplaceContract } from './marketplaceSlices';
import { setAuctionFactoryContract, addAuction, setAuctions, removeAuction } from './auctionFactorySlices';
import { uploadImageToIpfs, uploadMetadata } from '@/pages/api/ipfs';
import {
	uploadImageToFirebase,
	updateFirebaseWithNFT,
	toggleNFTListingStatus,
	changeNftOwnershipInFirebase,
} from '@/pages/api/firebase';
import { validateInput } from '@/app/components/CreateNFT/utils';
import Marketplace from '../abis/contracts/Marketplace.sol/Marketplace.json';
import AuctionFactory from '../abis/contracts/AuctionFactory.sol/AuctionFactory.json';
import Auction from '../abis/contracts/Auction.sol/Auction.json';
import { realtimeDb } from '../firebaseConfig';
import { get, ref, set, remove } from 'firebase/database';

export const connectToEthereum = async (dispatch) => {
	try {
		if (typeof window.ethereum !== 'undefined') {
			// Request account access
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

			// Update state with the current account
			dispatch(connectSuccess({ account: accounts[0] }));
			console.log('Connected account: ', accounts[0]);

			// Listen for account changes
			window.ethereum.on('accountsChanged', (accounts) => {
				// Update state with the new account
				if (accounts.length > 0) {
					dispatch(connectSuccess({ account: accounts[0] }));
					console.log('Account changed to: ', accounts[0]);
				} else {
					// Handle the case where the user has disconnected all accounts
					dispatch(connectFailure('No accounts connected'));
				}
			});

			return accounts[0];
		} else {
			// Prompt MetaMask installation
			window.alert('Please install MetaMask');
			dispatch(connectFailure('MetaMask not installed'));
		}
	} catch (error) {
		console.error('Error connecting to MetaMask');
		dispatch(connectFailure(error.message));
	}
};

export const getProvider = async () => new ethers.BrowserProvider(window.ethereum);

export const getSigner = async () => {
	const provider = await getProvider();
	const signer = await provider.getSigner();
	return signer;
};

export const loadMarketplaceContract = async (dispatch) => {
	const abi = Marketplace.abi;
	const address = '0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f';

	try {
		const signer = await getSigner();
		const marketplace = new ethers.Contract(address, abi, signer);

		// Dispatch successful contract  creation
		dispatch(setMarketplaceContract({ address, abi }));

		return marketplace;
	} catch (error) {
		console.log('Marketplace contract not deployed to the current network. Please select another with MetaMask.');
		dispatch(setError(error.message));
	}
};

export const loadAuctionFactoryContract = async (dispatch) => {
	const abi = AuctionFactory.abi;
	const address = '0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d';

	try {
		const signer = await getSigner();
		const auctionFactory = new ethers.Contract(address, abi, signer);

		dispatch(setAuctionFactoryContract({ address, abi }));

		return auctionFactory;
	} catch (error) {
		console.log('Auction Factory not deployed to the current network.');
		dispatch(setError(error.message));
	}
};

export const createContractInstance = async (contractDetails) => {
	const signer = await getSigner();
	return new ethers.Contract(contractDetails.address, contractDetails.abi, signer);
};

const pinToIpfs = async (cid) => {
	try {
		const response = await fetch('/api/pinata', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ cid }),
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error pinning with pinata', error);
	}
};

const uploadToFirebase = async (metadata, metadataToUpload, tokenId, seller) => {
	const firebaseImageUrl = await uploadImageToFirebase(metadata.image, metadataToUpload.displayName, tokenId, seller);
	await updateFirebaseWithNFT(firebaseImageUrl, metadataToUpload, tokenId, seller);
};

export const initiateMintSequence = async (metadata, marketplace, royaltyPercentage, abi, user) => {
	// Step 1: Check for input validation errors
	const validationErrors = validateInput(metadata);

	if (Object.keys(validationErrors).length === 0) {
		console.log('initiate mint sequence called');
		// Step 2: Upload Image to IPFS and get CID
		const imageCID = await uploadImageToIpfs(metadata.image);

		// Step 3: Destructure unnecessary data & update metadata with IPFS image CID
		const { siteLink, ...metadataToUpload } = metadata;
		metadataToUpload.image = imageCID;

		// Step 4: Upload + pin metadata to IPFS
		const metadataCID = await uploadMetadata(metadataToUpload);
		await pinToIpfs(imageCID);
		await pinToIpfs(metadataCID);

		// Step 5: Mint NFT and emit event
		const tx = await marketplace.createToken(
			metadataCID,
			parseInt(royaltyPercentage),
			ethers.parseEther(metadata.price),
			{
				value: ethers.parseEther('0.0025'),
			},
		);

		const receipt = await tx.wait();

		const marketItemCreatedLog = receipt.logs.find(
			(log) =>
				log.topics[0] === ethers.id('MarketItemCreated(uint256,address,address,address,uint256,uint256,bool,bool)'),
		);
		if (marketItemCreatedLog) {
			const contractInterface = new ethers.Interface(abi);
			const parsedLog = contractInterface.parseLog(marketItemCreatedLog);
			const eventData = extractMarketItemEventData(parsedLog);
			await uploadToFirebase(metadata, metadataToUpload, eventData.tokenId, user.account);
		}

		console.log('Smart contract call successful');
	} else {
		window.alert('Invalid data - Please see console and try again');
		console.error('Validation Errors: ', validationErrors);
	}
};

const extractMarketItemEventData = (parsedLog) => {
	return {
		tokenId: parsedLog.args[0],
		originalOwner: parsedLog.args[1],
		seller: parsedLog.args[2],
		owner: parsedLog.args[3],
		royaltyPercentage: parsedLog.args[4],
		price: ethers.formatEther(parsedLog.args[5]),
		auction: parsedLog.args[6],
		sold: parsedLog.args[7],
	};
};

export const listenForCreatedAuctions = async (dispatch, auctionFactoryContract) => {
	auctionFactoryContract.on(
		'AuctionCreated',
		async (nftId, startingPrice, startTime, auctionDuration, seller, auctionAddress) => {
			// Add auction to firebase
			const auctionData = {
				nftId: nftId.toString(),
				startingPrice: ethers.formatEther(startingPrice).toString(),
				startTime: startTime.toString(),
				auctionDuration: auctionDuration.toString(),
				sellerAddress: seller,
				auctionAddress: auctionAddress,
			};

			try {
				console.log(auctionData);
				dispatch(addAuction(auctionData));

				const auctionRef = ref(realtimeDb, `auctions/${nftId}`);
				await set(auctionRef, auctionData);
			} catch (error) {
				console.error('Error adding auction data to firebase: ', error);
			}
		},
	);
};

export const loadActiveAuctions = async (dispatch) => {
	try {
		// Reference to the auctions in Firebase
		const auctionsRef = ref(realtimeDb, 'auctions');
		console.log('load active - ref found', auctionsRef);

		// Fetch the auctions data
		const snapshot = await get(auctionsRef);
		if (snapshot.exists()) {
			const auctionsData = snapshot.val();
			console.log('load active - snapshot received', auctionsData);

			const fetchedAuctions = Object.entries(auctionsData).map(([nftId, auctionData]) => {
				return { nftId, ...auctionData };
			});

			console.log('load active - fetched', fetchedAuctions);

			dispatch(setAuctions(fetchedAuctions));
		}
	} catch (error) {
		console.error('Error loading active auctions: ', error);
	}
};

export const createAuction = async (auctionFactoryContract, startingPrice, auctionDuration, nftId, seller, abi) => {
	try {
		const startingPriceWei = ethers.parseEther(startingPrice);
		const auctionDurationInSeconds = parseInt(auctionDuration, 10) * 60;

		const tx = await auctionFactoryContract.createAuction(startingPriceWei, auctionDurationInSeconds, nftId, seller);

		const receipt = await tx.wait();

		if (receipt) {
			await toggleNFTListingStatus(seller.toLowerCase(), nftId);
		}

		return receipt;
	} catch (error) {
		console.error('Error creating new auction: ', error);
	}
};

export const getSellerAddress = async (marketplace, tokenId) => await marketplace.getSellerAddress(tokenId);

export const purchaseNft = async (marketplace, id, user) => {
	try {
		const seller = await getSellerAddress(marketplace, id);
		const price = await marketplace.getNFTPrice(id);
		const tx = await marketplace.createMarketSale(id, { value: price });
		const receipt = await tx.wait();

		console.log('Transaction Successful!');

		if (receipt) {
			await toggleNFTListingStatus(seller.toLowerCase(), id);
			await changeNftOwnershipInFirebase(id, user);
		}
	} catch (error) {
		console.error('Error purchasing NFT: ', error);
	}
};

export const endAuction = async (id, sellerAddress, contractAddress) => {
	try {
		const signer = await getSigner();
		const auctionContract = new ethers.Contract(contractAddress, Auction.abi, signer);
		await auctionContract.endAuction(id);
	} catch (error) {
		console.error('Error calling smart contract endAuction');
	}
	return;
};

export const listenForEndedAuctions = async (dispatch, contractAddress) => {
	try {
		const signer = await getSigner();
		const auctionContract = new ethers.Contract(contractAddress, Auction.abi, signer);

		auctionContract.on('AuctionEnded', async (nftId, highestBidder) => {
			dispatch(removeAuction(nftId));

			const auctionRef = ref(realtimeDb, `auctions/${nftId}`);
			await remove(auctionRef);

			console.log(`Auction with ID ${nftId} has been removed.`);

			await toggleNFTListingStatus(sellerAddress.toLowerCase(), nftId.toString());
			await changeNftOwnershipInFirebase(nftId.toString(), highestBidder.toString());
		});
	} catch (error) {
		console.error('AuctionEnded event not emitted');
	}
};
