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

	useEffect(() => {
		const runChecks = async () => {
			const confirmationNeeded = await checkIfEndedConfirmationNeeded(id);
			setEndedConfirmationNeeded(confirmationNeeded);
		};
		runChecks();

		console.log('Ended confirmation needed: ', endedConfirmationNeeded);
	}, []);

	useEffect(() => {
		let cleanupFunc = () => {};

		const loadAuctionEndedListener = async () => {
			if (auction) {
				cleanupFunc = await listenForEndedAuctions(dispatch, auction.address);
			}
		};
		loadAuctionEndedListener();

		// Cleanup function is called when the component is unmounted
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
				setAuctionActive(false);
				resetUserData();
				setLoading(false);
			}, 3000);
		}
	}, [auctionComplete]);

	const handleConfirmEndAuction = async () => {
		try {
			setLoading(true);

			if (user.account === auction.seller) {
				await endAuction(auction.address);
			} else {
				await confirmEndAuction(auction.address);
			}

			checkEndedAuctions();
			setAuctionComplete(true);
		} catch (error) {
			console.error('Error ending auction', error);
		}
	};

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
