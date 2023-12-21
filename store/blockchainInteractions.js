import { ethers } from 'ethers';
import { connectSuccess, connectFailure } from './connectSlices';
import { setError, setMarketplaceContract } from './marketplaceSlices';
import {
	setAuctionFactoryContract,
	addAuction,
	setAuctions,
	removeAuction,
	bid,
} from './auctionFactorySlices';
import { uploadImageToIpfs, uploadMetadata } from '@/pages/api/ipfs';
import {
	uploadImageToFirebase,
	updateFirebaseWithNFT,
	toggleNFTListingStatus,
	changeNftOwnershipInFirebase,
	changePrice,
} from '@/pages/api/firebase';
import { validateInput } from '@/app/components/CreateNFT/utils';
import Marketplace from '../abis/contracts/Marketplace.sol/Marketplace.json';
import AuctionFactory from '../abis/contracts/AuctionFactory.sol/AuctionFactory.json';
import Auction from '../abis/contracts/Auction.sol/Auction.json';
import { realtimeDb } from '../firebaseConfig';
import { get, ref, set, remove, update } from 'firebase/database';

export const connectToEthereum = async (dispatch) => {
	try {
		if (typeof window.ethereum !== 'undefined') {
			// Request account access
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			});

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
	const address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

	try {
		const signer = await getSigner();
		const marketplace = new ethers.Contract(address, abi, signer);

		// Dispatch successful contract  creation
		dispatch(setMarketplaceContract({ address, abi }));

		return marketplace;
	} catch (error) {
		console.log(
			'Marketplace contract not deployed to the current network. Please select another with MetaMask.',
		);
		dispatch(setError(error.message));
	}
};

export const loadAuctionFactoryContract = async (dispatch) => {
	const abi = AuctionFactory.abi;
	const address = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

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

export const getSellerAddress = async (marketplace, tokenId) =>
	await marketplace.getSellerAddress(tokenId);

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
	console.log('Upload to firebase called');
	const firebaseImageUrl = await uploadImageToFirebase(
		metadata.image,
		metadataToUpload.displayName,
		tokenId,
		seller,
	);
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

		const iface = new ethers.Interface(Marketplace.abi);
		const events = receipt.logs.map((log) => iface.parseLog(log)).filter((log) => log != null);
		const event = events.find((event) => event.name === 'MarketItemCreated');

		if (event) {
			const tokenId = event.args[0];
			await uploadToFirebase(metadata, metadataToUpload, tokenId, user.account);
		}

		console.log('Smart contract call successful');
	} else {
		window.alert('Invalid data - Please see console and try again');
		console.error('Validation Errors: ', validationErrors);
	}
};

export const createAuction = async (
	auctionFactoryContract,
	marketplace,
	startingPrice,
	auctionDuration,
	nftId,
	seller,
) => {
	try {
		const startingPriceWei = ethers.parseEther(startingPrice);
		const auctionDurationInSeconds = parseInt(auctionDuration, 10) * 60;

		const marketplaceAddress = await marketplace.getAddress();

		await marketplace.giveApproval(marketplaceAddress, nftId);

		const tx = await auctionFactoryContract.createAuction(
			startingPriceWei,
			auctionDurationInSeconds,
			nftId,
			seller,
		);

		const receipt = await tx.wait();

		if (receipt) {
			await toggleNFTListingStatus(seller.toLowerCase(), nftId);
		}

		return receipt;
	} catch (error) {
		console.error('Error creating new auction: ', error);
	}
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
				currentBid: null,
			};

			try {
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

		// Fetch the auctions data
		const snapshot = await get(auctionsRef);
		if (snapshot.exists()) {
			const auctionsData = snapshot.val();

			const fetchedAuctions = Object.entries(auctionsData).map(([nftId, auctionData]) => {
				return { nftId, ...auctionData };
			});

			dispatch(setAuctions(fetchedAuctions));
		} else {
			dispatch(setAuctions([]));
		}
	} catch (error) {
		console.error('Error loading active auctions: ', error);
	}
};

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

export const endAuction = async (contractAddress) => {
	try {
		const signer = await getSigner();
		const auctionContract = new ethers.Contract(contractAddress, Auction.abi, signer);
		await auctionContract.endAuction();
	} catch (error) {
		console.error('Error calling smart contract endAuction', error);
	}
	return;
};

export const callAuctionEndTimeReached = async (dispatch, nftId, auctionAddress) => {
	try {
		const signer = await getSigner();
		const auctionContract = new ethers.Contract(auctionAddress, Auction.abi, signer);

		// Reference to the auction in the 'auctions' node
		const auctionRef = ref(realtimeDb, `auctions/${nftId}`);

		// Retrieve auction data
		const snapshot = await get(auctionRef);
		if (snapshot.exists()) {
			const data = snapshot.val();

			// Remove auction from 'auctions' node
			dispatch(removeAuction(nftId));
			await remove(auctionRef);

			// Add AuctionEnded data to endedAuctions in realtime database
			const endedAuctionsRef = ref(realtimeDb, 'endedAuctions');
			await set(endedAuctionsRef, {
				[nftId]: {
					nftId: nftId,
					seller: data.sellerAddress,
					address: data.auctionAddress,
					highestBid: data.currentBid ? data.currentBid : data.startingPrice,
				},
			});

			await toggleNFTListingStatus(data.sellerAddress.toLowerCase(), nftId);

			console.log(`Auction with ID ${nftId} has been moved to ended auctions.`);
		} else {
			console.log(`Auction data for ID ${nftId} not found.`);
		}
	} catch (error) {
		console.error('Error ending auction on timeout: ', error);
	}
};

export const listenForEndedAuctions = async (dispatch, contractAddress) => {
	try {
		const signer = await getSigner();
		const auctionContract = new ethers.Contract(contractAddress, Auction.abi, signer);

		auctionContract.on(
			'AuctionEnded',
			async (nftId, highestBidder, seller, nullAddress, highestBid) => {
				// Reference to the auction in the 'auctions' node
				const auctionRef = ref(realtimeDb, `auctions/${nftId}`);
				const endedAuctionRef = ref(realtimeDb, `endedAuctions/${nftId}`);

				// Retrieve auction data
				const auctionSnapshot = await get(auctionRef);
				const endedAuctionSnapshot = await get(endedAuctionRef);

				if (auctionSnapshot.exists()) {
					// Remove auction from 'auctions' node
					dispatch(removeAuction(nftId.toString()));
					await remove(auctionRef);
				} else if (endedAuctionSnapshot.exists()) {
					// Remove auction from 'endedAuctions' node
					await remove(endedAuctionRef);
				} else {
					console.log(`Auction data for ID ${nftId} not found.`);
				}

				// Additional logic for NFT listing status and ownership change
				await toggleNFTListingStatus(seller.toLowerCase(), nftId.toString());

				// If a bid was made on the auction, change ownership
				if (seller.toLowerCase() !== highestBidder.toLowerCase() && highestBidder !== nullAddress) {
					await changePrice(nftId, seller.toLowerCase(), ethers.formatEther(highestBid));
					await changeNftOwnershipInFirebase(nftId, highestBidder.toLowerCase());
				}
			},
		);
	} catch (error) {
		console.error('Error handling AuctionEnded event:', error);
	}
};

export const placeBid = async (auctionAddress, amount) => {
	try {
		const signer = await getSigner();
		const auction = new ethers.Contract(auctionAddress, Auction.abi, signer);
		await auction.bid({ value: ethers.parseEther(amount) });
	} catch (error) {
		console.error('Error placing bid on auction', error);
	}
	return;
};

export const listenForBidEvents = async (dispatch, auctionAddress, nftId) => {
	try {
		const signer = await getSigner();
		const auction = new ethers.Contract(auctionAddress, Auction.abi, signer);

		auction.on('Bid', async (bidder, bidAmount) => {
			const bidData = {
				bidder: bidder,
				currentBid: ethers.formatEther(bidAmount),
				address: auctionAddress,
			};

			dispatch(bid(bidData));

			const auctionRef = ref(realtimeDb, `auctions/${nftId}`);
			update(auctionRef, { currentBid: bidData.currentBid })
				.then(() => {
					console.log('DB updated with bid!');
				})
				.catch((error) => {
					console.error('Error updating current bid: ', error);
				});
		});
	} catch (error) {
		console.error('Failed to update current bid in database', error);
	}
};
