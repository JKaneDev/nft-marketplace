import { ethers } from 'ethers';
import { connectSuccess, connectFailure } from './connectSlices';
import { setMarketplaceContract } from './marketplaceSlices';
import { setAuctionFactoryContract, addAuction, setAuctions } from './auctionFactorySlices';
import { uploadImageToIpfs, uploadMetadata } from '@/pages/api/ipfs';
import { uploadImageToFirebase, updateFirebaseWithNFT } from '@/pages/api/firebase';
import { validateInput } from '@/app/components/CreateNFT/utils';
import Marketplace from '../abis/contracts/Marketplace.sol/Marketplace.json';
import AuctionFactory from '../abis/contracts/AuctionFactory.sol/AuctionFactory.json';
import Auction from '../abis/contracts/Auction.sol/Auction.json';
import moment from 'moment';
import { realtimeDb } from '@/firebaseConfig';
import { get, ref, set } from 'firebase/database';

export const connectToEthereum = async (dispatch) => {
	try {
		if (typeof window.ethereum !== 'undefined') {
			// Request account access
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
			const signer = await provider.getSigner();

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

export const getProvider = async () => new ethers.JsonRpcProvider('http://127.0.0.1:8545/');

export const getSignerAddress = async () => {
	const provider = await getProvider();
	const signer = provider.getSigner();
	return signer.getAddress();
};

export const loadMarketplaceContract = async (dispatch) => {
	const abi = Marketplace.abi;
	const address = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';

	try {
		const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
		const signer = await provider.getSigner();
		const marketplace = new ethers.Contract(address, abi, signer);

		// Dispatch successful contract  creation
		dispatch(setMarketplaceContract({ address, abi }));

		return marketplace;
	} catch (error) {
		console.log('Marketplace contract not deployed to the current network. Please select another with MetaMask.');
	}
};

export const loadAuctionFactoryContract = async (dispatch) => {
	const abi = AuctionFactory.abi;
	const address = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';

	try {
		const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
		const signer = await provider.getSigner();
		const auctionFactory = new ethers.Contract(address, abi, signer);

		dispatch(setAuctionFactoryContract({ address, abi }));

		return auctionFactory;
	} catch (error) {
		console.log('Auction Factory not deployed to the current network.');
	}
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

export const initiateMintSequence = async (metadata, marketplace, tokenId, seller, royaltyPercentage) => {
	// Step 1: Check for input validation errors
	const validationErrors = validateInput(metadata);

	if (Object.keys(validationErrors).length === 0) {
		// Step 2: Upload Image to IPFS and get CID
		const imageCID = await uploadImageToIpfs(metadata.image);

		// Step 3: Destructure unnecessary data & update metadata with IPFS image CID
		const { siteLink, imagePreview, ...metadataToUpload } = metadata;
		metadataToUpload.image = imageCID;

		// Step 4: Upload metadata to IPFS
		const metadataCID = await uploadMetadata(metadataToUpload);

		console.log('Metadata upload to IPFS successful');

		// Step 5: Mint NFT and emit event
		await marketplace.createToken(metadataCID, parseInt(royaltyPercentage), ethers.parseEther(metadata.price), {
			value: ethers.parseEther('0.0025'),
		});

		// Step 6: Pin data to IPFS and create duplicate in firebase for fast retrieval
		await pinToIpfs(imageCID);
		await pinToIpfs(metadataCID);
		const firebaseImageUrl = await uploadImageToFirebase(metadata.image, metadata.displayName, tokenId, seller);
		await updateFirebaseWithNFT(firebaseImageUrl, metadataToUpload, tokenId, seller);
		console.log('Metadata uploaded to firebase!');

		console.log('Smart contract call successful');
	} else {
		window.alert('Invalid data - Please see console and try again');
		console.error('Validation Errors: ', validationErrors);
	}
};

export const listenForCreatedAuctions = async (dispatch, auctionFactoryContract) => {
	auctionFactoryContract.on(
		'AuctionCreated',
		async (nftId, startingPrice, startTime, auctionDuration, seller, auctionAddress) => {
			console.log(`Auction Created for NFT ID: ${nftId}`);

			const formattedStartTime = moment.unix(startTime).format('YY:MM:DD HH:mm');
			const formattedDuration = moment.duration(auctionDuration, 'seconds').format('DD:HH:mm:ss');
			const formattedEndTime = moment.unix(startTime).add(auctionDuration, 'seconds').format('YY:MM:DD HH:mm:ss');

			// Add auction to firebase
			const auctionData = {
				startingPrice: startingPrice.toString(),
				startTime: formattedStartTime,
				auctionDuration: formattedDuration,
				auctionEndTime: formattedEndTime,
				sellerAddress: seller,
				auctionAddress: auctionAddress,
			};

			try {
				const auctionRef = ref(realtimeDb, `auctions/${nftId}`);
				await set(auctionRef, auctionData);

				dispatch(addAuction(auctionData));
			} catch (error) {
				console.error('Error adding auction data to firebase: ', error);
			}
		},
	);
};

export const loadActiveAuctions = async () => {
	const dispatch = useDispatch();

	try {
		// Reference to the auctions in Firebase
		const auctionsRef = ref(realtimeDb, 'auctions');

		// Fetch the auctions data
		const snapshot = await get(auctionsRef);
		if (snapshot.exists()) {
			const auctionsData = snapshot.val();

			const fetchedAuctions = Object.entries(auctionsData).reduce((acc, [nftId, auctionData]) => {
				if (auctionData.active) {
					acc.push({ nftId, ...auctionData });
				}
				return acc;
			}, []);

			dispatch(setAuctions(fetchedAuctions));
		}
	} catch (error) {
		console.error('Error loading active auctions: ', error);
	}
};

export const createAuction = async (auctionFactoryContract, startingPrice, auctionDuration, nftId, dispatch) => {
	try {
		const startingPriceWei = ethers.utils.parseEther(startingPrice);
		const auctionDurationInSeconds = parseInt(auctionDuration, 10) * 60;
		const usersAddress = await getSignerAddress();
		const tx = await auctionFactoryContract.createAuction(
			startingPriceWei,
			auctionDurationInSeconds,
			nftId,
			usersAddress,
		);

		const receipt = await tx.wait();

		return receipt;
	} catch (error) {
		console.error('Error creating new auction: ', error);
	}
};
