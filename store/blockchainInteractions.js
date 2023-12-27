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
	listNFT,
	delistNFT,
	changeNftOwnershipInFirebase,
	changePrice,
} from '@/pages/api/firebase';
import { validateInput } from '@/app/components/CreateNFT/utils';
import Marketplace from '../abis/contracts/Marketplace.sol/Marketplace.json';
import AuctionFactory from '../abis/contracts/AuctionFactory.sol/AuctionFactory.json';
import Auction from '../abis/contracts/Auction.sol/Auction.json';
import { realtimeDb } from '../firebaseConfig';
import { get, ref, set, remove, update } from 'firebase/database';

/**
 * Connects to the Ethereum blockchain using MetaMask and updates the state with the current account.
 * Also listens for account changes and updates the state accordingly.
 * @param {Function} dispatch - The dispatch function from Redux to update the state.
 * @returns {string} - The current account address.
 * @throws {Error} - If there is an error connecting to MetaMask.
 */
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

/**
 * Loads the marketplace contract and returns an instance of the contract.
 *
 * @param {function} dispatch - The dispatch function from Redux.
 * @returns {Object} - An instance of the marketplace contract.
 * @throws {Error} - If the marketplace contract is not deployed to the current network.
 */
export const loadMarketplaceContract = async (dispatch) => {
	const abi = Marketplace.abi;
	const address = '0x153491b42133D4A2083A8C7BbC20cA28B75bD833';

	try {
		const signer = await getSigner();
		const marketplace = new ethers.Contract(address, abi, signer);

		// Dispatch successful contract  creation
		dispatch(setMarketplaceContract({ address, abi }));

		return marketplace;
	} catch (error) {
		window.alert(
			'Marketplace contract not deployed to the current network. Please select another with MetaMask.',
		);
		dispatch(setError(error.message));
	}
};

/**
 * Loads the Auction Factory contract and returns an instance of the contract.
 *
 * @param {function} dispatch - The dispatch function from Redux.
 * @returns {Promise<Object>} - An instance of the Auction Factory contract.
 * @throws {Error} - If the Auction Factory is not deployed to the current network.
 */
export const loadAuctionFactoryContract = async (dispatch) => {
	const abi = AuctionFactory.abi;
	const address = '0x6ad73bc100d3539a690bB0C7c40AedeC4dC69AeC';

	try {
		const signer = await getSigner();
		const auctionFactory = new ethers.Contract(address, abi, signer);

		dispatch(setAuctionFactoryContract({ address, abi }));

		return auctionFactory;
	} catch (error) {
		window.alert('Auction Factory not deployed to the current network.');
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
	const firebaseImageUrl = await uploadImageToFirebase(
		metadata.image,
		metadataToUpload.displayName,
		tokenId,
		seller,
	);
	await updateFirebaseWithNFT(firebaseImageUrl, metadataToUpload, tokenId, seller);
};

/**
 * Initiates the minting sequence for creating an NFT in a marketplace.
 *
 * @param {Object} metadata - The metadata of the NFT.
 * @param {Object} marketplace - The marketplace contract instance.
 * @param {number} royaltyPercentage - The royalty percentage for the NFT.
 * @param {Object} user - The user object containing the user's account information.
 * @returns {Promise<void>} - A promise that resolves when the minting sequence is completed.
 */
export const initiateMintSequence = async (metadata, marketplace, royaltyPercentage, user) => {
	// Step 1: Check for input validation errors
	const validationErrors = validateInput(metadata);

	if (Object.keys(validationErrors).length === 0) {
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
	} else {
		window.alert('Invalid data - Please see console and try again');
		console.error('Validation Errors: ', validationErrors);
	}
};

/**
 *
 * Creates a new auction for an NFT in the marketplace.
 * @param {Object} auctionFactoryContract - The auction factory contract instance.
 * @param {Object} marketplace - The marketplace contract instance.
 * @param {string} startingPrice - The starting price of the auction.
 * @param {number} auctionDuration - The duration of the auction in minutes.
 * @param {number} nftId - The ID of the NFT.
 * @param {string} seller - The address of the seller.
 * @returns {Promise} - A promise that resolves with the transaction receipt when the auction is created.
 *
 */

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
			await listNFT(seller.toLowerCase(), nftId);
		}

		return receipt;
	} catch (error) {
		console.error('Error creating new auction: ', error);
	}
};

/**
 * Listens for created auctions and adds them to the Firebase database.
 *
 * @param {Function} dispatch - The dispatch function from Redux.
 * @param {Object} auctionFactoryContract - The auction factory contract instance.
 * @returns {Function} - A cleanup function that removes the listener.
 */
export const listenForCreatedAuctions = async (dispatch, auctionFactoryContract) => {
	const listener = async (
		nftId,
		startingPrice,
		startTime,
		auctionDuration,
		seller,
		auctionAddress,
	) => {
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
	};

	auctionFactoryContract.on('AuctionCreated', listener);

	// Return a cleanup function that removes the listener
	return () => {
		auctionFactoryContract.off('AuctionCreated', listener);
	};
};

/**
 * Loads active auctions from Firebase and dispatches the fetched auctions to the Redux store.
 *
 * @param {function} dispatch - The Redux dispatch function.
 * @returns {Promise<void>} - A promise that resolves when the auctions are loaded and dispatched.
 * @throws {Error} - If there is an error loading the active auctions.
 */
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

/**
 * Purchase an NFT from the marketplace.
 *
 * @param {Object} marketplace - The marketplace contract instance.
 * @param {string} id - The ID of the NFT to purchase.
 * @param {string} user - The user making the purchase.
 * @returns {Promise<void>} - A promise that resolves when the purchase is complete.
 */
export const purchaseNft = async (marketplace, id, user) => {
	try {
		const seller = await getSellerAddress(marketplace, id);
		const price = await marketplace.getNFTPrice(id);
		const tx = await marketplace.createMarketSale(id, { value: price });
		const receipt = await tx.wait();

		if (receipt) {
			await delistNFT(seller.toLowerCase(), id);
			await changeNftOwnershipInFirebase(id, user);
		}
	} catch (error) {
		console.error('Error purchasing NFT: ', error);
	}
};

/**
 * Ends an auction by calling the endAuction function of the specified smart contract.
 *
 * @param {string} contractAddress - The address of the smart contract.
 * @returns {Promise<void>} - A promise that resolves when the auction is ended successfully.
 */
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

/**
 * Confirms the end of an auction by calling the smart contract's confirmAuctionEnd function,
 * and if successful, ends the auction by calling the endAuction function. This allows users
 * other than the seller to end the auction. Maintaining security but ensuring the seller
 * does not have to be online to end the auction.
 *
 * @param {string} auctionAddress - The address of the auction contract.
 * @returns {Promise<void>} - A promise that resolves when the auction is confirmed and ended successfully.
 */
export const confirmEndAuction = async (auctionAddress) => {
	try {
		const signer = await getSigner();
		const auctionContract = new ethers.Contract(auctionAddress, Auction.abi, signer);
		const tx = await auctionContract.confirmAuctionEnd();
		const receipt = await tx.wait();
		if (receipt) await auctionContract.endAuction();
	} catch (error) {
		console.error('Error calling smart contract confirmEndAuction', error);
	}
	return;
};

/**
 * Calls the function when the auction end time is reached.
 * Removes the auction from the 'auctions' node, adds the auction data to the 'endedAuctions' node,
 * and delists the NFT associated with the auction.
 *
 * @param {function} dispatch - The dispatch function to remove the auction from the state.
 * @param {string} nftId - The ID of the NFT associated with the auction.
 * @param {string} auctionAddress - The address of the auction contract.
 * @returns {Promise<void>} - A promise that resolves when the auction is ended.
 */
export const callAuctionEndTimeReached = async (dispatch, nftId) => {
	try {
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
			await update(endedAuctionsRef, {
				[nftId]: {
					nftId: nftId,
					seller: data.sellerAddress,
					address: data.auctionAddress,
					highestBid: data.currentBid ? data.currentBid : data.startingPrice,
				},
			});

			await delistNFT(data.sellerAddress.toLowerCase(), nftId);

			console.log(`Auction with ID ${nftId} has been moved to ended auctions.`);
		} else {
			console.log(`Auction data for ID ${nftId} not found.`);
		}
	} catch (error) {
		console.error('Error ending auction on timeout: ', error);
	}
};

/**
 * Listens for ended auctions and performs necessary actions based on the auction outcome.
 * @param {Function} dispatch - The dispatch function from Redux for updating the state.
 * @param {string} contractAddress - The address of the auction contract.
 * @returns {Function} - A cleanup function that removes the listener.
 * @throws {Error} - If there is an error handling the AuctionEnded event.
 */
export const listenForEndedAuctions = async (dispatch, contractAddress) => {
	try {
		const signer = await getSigner();
		const auctionContract = new ethers.Contract(contractAddress, Auction.abi, signer);

		const listener = async (nftId, highestBidder, seller, nullAddress, highestBid) => {
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
				console.log(`Auction data for ID ${nftId} removed from endedAuctions`);
			} else {
				console.log(`Auction data for ID ${nftId} not found.`);
			}

			// Additional logic for NFT listing status and ownership change
			await delistNFT(seller.toLowerCase(), nftId.toString());

			// If a bid was made on the auction, change ownership
			if (seller.toLowerCase() !== highestBidder.toLowerCase() && highestBidder !== nullAddress) {
				await changePrice(nftId, seller.toLowerCase(), ethers.formatEther(highestBid));
				await changeNftOwnershipInFirebase(nftId, highestBidder.toLowerCase());
			}
		};

		auctionContract.on('AuctionEnded', listener);

		// Return a cleanup function that removes the listener
		return () => {
			auctionContract.off('AuctionEnded', listener);
		};
	} catch (error) {
		console.error('Error handling AuctionEnded event:', error);
	}
};

/**
 * Places a bid on an auction.
 *
 * @param {string} auctionAddress - The address of the auction contract.
 * @param {string} amount - The amount of the bid in Ether.
 * @returns {Promise<void>} - A promise that resolves when the bid is successfully placed.
 */
export const placeBid = async (auctionAddress, amount) => {
	try {
		const signer = await getSigner();
		const auction = new ethers.Contract(auctionAddress, Auction.abi, signer);
		await auction.bid({ value: ethers.parseEther(amount) });
	} catch (error) {
		console.error('Error placing bid on auction', error);
	}
};

/**
 * Listens for bid events on the blockchain and updates the bid data in the database.
 *
 * @param {Function} dispatch - The dispatch function from Redux to update the bid data in the store.
 * @param {string} auctionAddress - The address of the auction contract on the blockchain.
 * @param {string} nftId - The ID of the NFT associated with the auction.
 * @returns {Function} - A cleanup function to remove the event listener.
 * @throws {Error} - If there is an error updating the current bid in the database.
 */
export const listenForBidEvents = async (dispatch, auctionAddress, nftId) => {
	try {
		const signer = await getSigner();
		const auction = new ethers.Contract(auctionAddress, Auction.abi, signer);

		const listener = async (bidder, bidAmount) => {
			const bidData = {
				bidder: bidder,
				currentBid: ethers.formatEther(bidAmount),
				address: auctionAddress,
			};

			dispatch(bid(bidData));

			const auctionRef = ref(realtimeDb, `auctions/${nftId}`);
			update(auctionRef, { currentBid: bidData.currentBid })
				.then(() => {
					console.log('DB updated with bid!', bidData.currentBid);
				})
				.catch((error) => {
					console.error('Error updating current bid: ', error);
				});
		};

		auction.on('Bid', listener);

		return () => {
			auction.off('Bid', listener);
		};
	} catch (error) {
		console.error('Failed to update current bid in database', error);
	}
};
