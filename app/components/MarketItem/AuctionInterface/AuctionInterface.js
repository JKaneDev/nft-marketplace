import React, { useState, useEffect } from 'react';
import Style from './AuctionInterface.module.scss';
import { FaInfoCircle, FaGavel } from 'react-icons/fa';
import { RingLoader } from 'react-spinners';
import { useDispatch, useSelector } from 'react-redux';

import {
	endAuction,
	listenForEndedAuctions,
	confirmEndAuction,
} from '@/store/blockchainInteractions';
import { ref, get } from 'firebase/database';
import { realtimeDb } from '@/firebaseConfig';

const AuctionInterface = ({
	id,
	resetUserData,
	checkEndedAuctions,
	loading,
	setLoading,
	setAuctionActive,
	setStartingPrice,
	setDuration,
	handleShowAuctionInfo,
	handleAuctionStart,
	isInfoVisible,
}) => {
	const dispatch = useDispatch();

	const user = useSelector((state) => state.connection.account);

	const [endedConfirmationNeeded, setEndedConfirmationNeeded] = useState(false);
	const [auctionComplete, setAuctionComplete] = useState(false);
	const [auction, setAuction] = useState(null);

	/**
	 * Checks if awaiting end to determine if end confirmation
	 * should be rendered
	 */
	useEffect(() => {
		const runChecks = async () => {
			const confirmationNeeded = await checkIfEndedConfirmationNeeded(id);
			setEndedConfirmationNeeded(confirmationNeeded);
		};
		runChecks();
	}, [id]);

	/**
	 * Loads the auction ended listener.
	 * If an auction is available, it sets up a listener to detect when the auction ends.
	 * @returns {Promise<void>} A promise that resolves when the listener is set up.
	 */
	useEffect(() => {
		let cleanupFunc = () => {};

		const loadAuctionEndedListener = async () => {
			if (auction) {
				cleanupFunc = listenForEndedAuctions(dispatch, auction.address);
			}
		};
		loadAuctionEndedListener();

		return () => {
			cleanupFunc();
		};
	}, [auction]);

	useEffect(() => {
		if (endedConfirmationNeeded == true) {
			const getAuction = async () => {
				const data = await getEndedAuctionData(id);
				setAuction(data);
			};
			getAuction();
		}
	}, [endedConfirmationNeeded]);

	useEffect(() => {
		if (auctionComplete) {
			setTimeout(() => {
				checkEndedAuctions();
				setAuctionActive(false);
				resetUserData();
				setLoading(false);
			}, 3000);
		}
	}, [auctionComplete]);

	/**
	 * Handles the confirmation of ending an auction.
	 * If the user is the seller, it ends the auction by calling the endAuction function.
	 * If the user is not the seller, it confirms the duration has elapsed by calling confirmEndAuction.
	 * After the auction is ended, it checks for ended auctions and sets the auctionComplete state to true.
	 * @async
	 * @function handleConfirmEndAuction
	 * @throws {Error} If there is an error ending the auction.
	 */
	const handleConfirmEndAuction = async () => {
		try {
			setLoading(true);

			if (user.account === auction.seller) {
				await endAuction(auction.address);
			} else {
				await confirmEndAuction(auction.address);
			}

			setAuctionComplete(true);
		} catch (error) {
			console.error('Error ending auction', error);
		}
	};

	/**
	 * Checks if an auction has ended and confirmation is needed.
	 * @param {string} id - The ID of the auction.
	 * @returns {Promise<boolean>} - A promise that resolves to true if confirmation is needed, false otherwise.
	 */
	const checkIfEndedConfirmationNeeded = async (id) => {
		const auctionsRef = ref(realtimeDb, 'endedAuctions');
		const snapshot = await get(auctionsRef);
		if (snapshot.exists()) {
			const data = snapshot.val();
			const auctions = Object.values(data);
			const auction = auctions.find((auction) => auction.nftId === id);
			if (auction) return true;
		}
		return false;
	};

	/**
	 * Retrieves the ended auction data from firebase for a given ID.
	 * @param {string} id - The ID of the auction.
	 * @returns {Object|undefined} - The ended auction data if found, otherwise undefined.
	 */
	const getEndedAuctionData = async (id) => {
		const auctionsRef = ref(realtimeDb, 'endedAuctions');
		const snapshot = await get(auctionsRef);
		if (snapshot.exists()) {
			const data = snapshot.val();
			const auctions = Object.values(data);
			const auction = auctions.find((auction) => auction.nftId === id);
			if (auction) return auction;
		}
	};

	return (
		<div className={Style.card_auction}>
			{loading ? (
				<RingLoader size={30} color={'#fff'} />
			) : (
				<>
					{endedConfirmationNeeded == true ? (
						<div className={Style.card_auction_end}>
							<button onClick={handleConfirmEndAuction}>Confirm End</button>
						</div>
					) : (
						<>
							<div className={Style.card_auction_info}>
								<p>Create Auction Listing</p>
								<FaInfoCircle
									className={Style.card_auction_info_icon}
									onMouseEnter={handleShowAuctionInfo}
									onMouseLeave={handleShowAuctionInfo}
								/>
								<p
									className={`${Style.card_auction_info_more} ${
										isInfoVisible ? Style.visible : ''
									}`}
								>
									Please enter the auction start price in ETH and the time in Minutes. E.g. '2.5' &
									'60'
								</p>
							</div>
							<div className={Style.card_auction_list}>
								<input
									type='text'
									placeholder='(ETH): E.g. 2.5'
									onChange={(e) => setStartingPrice(e.target.value)}
								/>
								<input
									type='text'
									placeholder='(Mins): E.g. 60'
									onChange={(e) => setDuration(e.target.value)}
								/>
								<div className={Style.card_auction_list_wrapper} onClick={handleAuctionStart}>
									<FaGavel className={Style.card_auction_list_wrapper_icon} />
								</div>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default AuctionInterface;
