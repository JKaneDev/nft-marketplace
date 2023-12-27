import React, { useState, useEffect } from 'react';
import Style from './CurrentAuction.module.scss';
import Image from 'next/image';

import {
	FaArrowLeft,
	FaArrowRight,
	FaUserCircle,
	FaCheckCircle,
	FaTimesCircle,
} from 'react-icons/fa';
import { MdTimer } from 'react-icons/md';

// BLOCKCHAIN & BACKEND IMPORTS
import { db } from '@/firebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import {
	placeBid,
	listenForCreatedAuctions,
	createContractInstance,
	listenForBidEvents,
	loadActiveAuctions,
	callAuctionEndTimeReached,
} from '@/store/blockchainInteractions';

// INTERNAL IMPORTS
import images from '../../../assets/index';
import { useSelector, useDispatch } from 'react-redux';
import { AuctionTimer } from '../componentindex';
import { RingLoader } from 'react-spinners';

const CurrentAuction = () => {
	const dispatch = useDispatch();

	const user = useSelector((state) => state.connection.account);
	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const auctionFactoryLoaded = useSelector((state) => state.auctionFactory.isLoaded);
	const auctionFactoryDetails = useSelector((state) => state.auctionFactory.contractDetails);
	const marketplaceDetails = useSelector((state) => state.marketplace.contractDetails);

	const [homepage, setHomepage] = useState(true);
	const [loading, setLoading] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentAuction, setCurrentAuction] = useState(
		auctions.length > 0 ? auctions[currentIndex] : null,
	);
	const [nftData, setNftData] = useState(null);
	const [seller, setSeller] = useState(null);
	const [sellerImage, setSellerImage] = useState(null);
	const [sellerAccount, setSellerAccount] = useState(null);
	const [bidAmount, setBidAmount] = useState(null);
	const [bidding, setBidding] = useState(false);

	useEffect(() => {
		let cleanupFuncs = [];

		const loadListeners = async () => {
			if (auctionFactoryLoaded && currentAuction) {
				const contract = await createContractInstance(auctionFactoryDetails);
				await loadActiveAuctions(dispatch);
				const cleanup1 = listenForCreatedAuctions(dispatch, contract);
				const cleanup2 = listenForBidEvents(
					dispatch,
					currentAuction.auctionAddress,
					currentAuction.nftId,
				);
				cleanupFuncs = [cleanup1, cleanup2];
			}
		};

		loadListeners();

		return () => {
			cleanupFuncs.forEach((cleanup) => cleanup());
		};
	}, [dispatch, auctionFactoryLoaded, currentAuction]);

	/* Displays new auction data when user navigates through auctions */
	useEffect(() => {
		if (auctions.length > 0) {
			setCurrentAuction(auctions[currentIndex]);
		}
	}, [currentIndex]);

	/* Fetches NFT for current auction */
	useEffect(() => {
		if (currentAuction) {
			getUserData(currentAuction.nftId);
		}
	}, [currentAuction]);

	/**
	 * Toggles to the previous auction in the list.
	 * Disallows negative index values.
	 */
	const togglePreviousAuction = () => {
		setCurrentIndex((prevIndex) => {
			const newIndex = (prevIndex - 1 + auctions.length) % auctions.length;
			return newIndex;
		});
	};

	/**
	 * Toggles to the next auction in the list.
	 * Disallows negative index values.
	 */
	const toggleNextAuction = () => {
		setCurrentIndex((prevIndex) => {
			const newIndex = (prevIndex + 1) % auctions.length;
			return newIndex;
		});
	};

	/**
	 * Retrieves user data for a given NFT ID.
	 * Sets data needed for JSX to state.
	 * @param {string} nftId - The ID of the NFT.
	 * @returns {Promise<void>} - A promise that resolves when the user data is retrieved.
	 */
	const getUserData = async (nftId) => {
		try {
			setLoading(true);
			const usersRef = collection(db, 'users');
			const querySnapshot = await getDocs(query(usersRef));
			let seller;
			let sellerAccount;
			let nftData;
			let sellerImage;

			querySnapshot.forEach((doc) => {
				const userData = doc.data();
				if (userData.ownedNFTs && userData.ownedNFTs[nftId]) {
					seller = userData.displayName;
					sellerImage = userData.profilePicture;
					sellerAccount = doc.id;
					nftData = userData.ownedNFTs[nftId];
				}
			});

			setNftData(nftData);
			setSeller(seller);
			setSellerImage(sellerImage);
			setSellerAccount(sellerAccount);

			setLoading(false);
		} catch (error) {
			console.error('Could not find owner of auctioned NFT: ', error);
		}
	};

	/**
	 * Handles the event when the end time of the current auction is reached.
	 * This function updates the loading state, calls the API to mark the auction as ended,
	 * and then sets a timeout to update the loading state again and either toggle to the next auction
	 * or set the current auction to null if there are no more auctions.
	 * @returns {Promise<void>} A promise that resolves when the function completes.
	 */
	const handleEndTimeReached = async () => {
		try {
			setLoading(true);

			await callAuctionEndTimeReached(dispatch, currentAuction.nftId);

			setTimeout(() => {
				setLoading(false);
				currentAuction[currentIndex + (1 % auctions.length)]
					? toggleNextAuction()
					: setCurrentAuction(null);
			}, 1500);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

	/**
	 * Handles the auction bid by placing a bid on the current auction.
	 * If the user is the owner of the NFT being auctioned, a window alert is displayed.
	 * Sets the loading state to true while placing the bid and then sets it to false after 1500ms.
	 * Finally, toggles the bidding state.
	 * @returns {Promise<void>} A promise that resolves when the bid is successfully placed or rejects if there is an error.
	 */
	const handleAuctionBid = async () => {
		try {
			if (user.account === sellerAccount) {
				window.alert('You are the owner of this NFT');
				return;
			}

			setLoading(true);
			await placeBid(currentAuction.auctionAddress, bidAmount);

			setTimeout(() => {
				setLoading(false);
				toggleBidding();
			}, 1500);
		} catch (error) {
			console.error('Failed to place bid on auction.');
		}
	};

	const toggleBidding = () => {
		setBidding(!bidding);
	};

	return (
		<div className={Style.auction}>
			<div className={Style.auction_container}>
				{loading ? (
					<RingLoader size={60} color='#fff' className={Style.loader} />
				) : (
					<>
						<div className={Style.auction_container_title}>
							<h1>{nftData ? nftData.name : 'No Active Auctions'}</h1>
							<div className={Style.auction_container_title_container}>
								<FaArrowLeft
									size={38}
									className={Style.auction_container_title_container_arrows}
									onClick={togglePreviousAuction}
								/>
								<FaArrowRight
									size={38}
									className={Style.auction_container_title_container_arrows}
									onClick={toggleNextAuction}
								/>
							</div>
						</div>
						<div className={Style.auction_container_wrapper}>
							<div className={Style.auction_container_wrapper_creator}>
								<>
									{currentAuction && sellerImage ? (
										<Image
											src={sellerImage}
											alt='account image of nft seller'
											className={Style.auction_container_wrapper_creator_img}
											width={50}
											height={50}
										/>
									) : (
										<FaUserCircle
											size={60}
											className={Style.auction_container_wrapper_creator_img}
										/>
									)}
								</>
								<p>Creator</p>
								<p>{seller ? seller : 'Unknown'}</p>
							</div>
							<br className={Style.br} />
							<div className={Style.auction_container_wrapper_collection}>
								<FaUserCircle size={38} className={Style.auction_container_wrapper_creator_img} />
								<p>Category</p>
								<p>{nftData ? nftData.category : 'Unknown'}</p>
							</div>
						</div>
						<div className={Style.auction_container_bid}>
							<div className={Style.auction_container_bid_wrapper}>
								<p>{currentAuction && currentAuction.currentBid ? 'Current Bid:' : 'No Bids'}</p>
								<p>
									{currentAuction && currentAuction.currentBid ? currentAuction.currentBid : '0'}
								</p>
								<Image
									src={images.eth}
									alt='eth symbol'
									className={Style.auction_container_bid_wrapper_icon}
								/>
							</div>
						</div>
						<div className={Style.auction_container_time}>
							<div className={Style.auction_container_time_duration}>
								<MdTimer size={38} />
								<p>Time Remaining:</p>
							</div>
							<div className={Style.auction_container_time_remaining}>
								{currentAuction ? (
									<AuctionTimer
										startTime={currentAuction.startTime}
										auctionDuration={currentAuction.auctionDuration}
										handleEndTimeReached={handleEndTimeReached}
										homepage={homepage}
									/>
								) : (
									<AuctionTimer />
								)}
							</div>
							<br />
							<div className={Style.auction_container_interact}>
								{bidding ? (
									<div className={Style.auction_container_interact_confirm}>
										<input
											type='text'
											onChange={(e) => setBidAmount(e.target.value)}
											placeholder='ETH Amount'
										/>
										<div className={Style.auction_container_interact_confirm_wrapper}>
											<button onClick={handleAuctionBid}>
												<FaCheckCircle />
											</button>
											<button onClick={toggleBidding}>
												<FaTimesCircle />
											</button>
										</div>
									</div>
								) : (
									<>
										{user &&
										user.account.toLowerCase() === currentAuction.sellerAddress.toLowerCase() ? (
											<button className={Style.auction_container_interact_btn_disabled} disabled>
												Your NFT
											</button>
										) : (
											<button onClick={toggleBidding}>Bid</button>
										)}
									</>
								)}
							</div>
						</div>
					</>
				)}
			</div>

			<div className={Style.auction_nft_wrapper}>
				<Image
					src={nftData ? nftData.image : images.placeholder}
					layout='fill'
					alt='current auction nft image'
					className={Style.auction_nft_wrapper_image}
				/>
			</div>
		</div>
	);
};

export default CurrentAuction;
