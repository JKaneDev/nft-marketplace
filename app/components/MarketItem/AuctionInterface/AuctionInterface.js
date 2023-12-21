import React, { useState, useEffect } from 'react';
import Style from './AuctionInterface.module.scss';
import { FaInfoCircle, FaGavel } from 'react-icons/fa';
import { RingLoader } from 'react-spinners';
import { useDispatch, useSelector } from 'react-redux';

import {
	endAuction,
	listenForEndedAuctions,
	createContractInstance,
} from '@/store/blockchainInteractions';
import { ref, get } from 'firebase/database';
import { realtimeDb } from '@/firebaseConfig';

const AuctionInterface = ({
	id,
	resetUserData,
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

	const [endedConfirmationNeeded, setEndedConfirmationNeeded] = useState(false);
	const [auctionComplete, setAuctionComplete] = useState(false);
	const [auction, setAuction] = useState(null);

	const marketplaceDetails = useSelector((state) => state.marketplace.contractDetails);

	useEffect(() => {
		const getOwner = async () => {
			const marketplace = await createContractInstance(marketplaceDetails);
			const owner = await marketplace.ownerOf(id);
			console.log('Owner of NFT with ID: ', owner, id);
		};
		getOwner();
	}, []);

	useEffect(() => {
		const runChecks = async () => {
			const confirmationNeeded = await checkIfEndedConfirmationNeeded(id);
			setEndedConfirmationNeeded(confirmationNeeded);
		};
		runChecks();
	}, []);

	useEffect(() => {
		const loadAuctionEndedListener = async () => {
			if (auction) {
				await listenForEndedAuctions(dispatch, auction.address);
			}
		};
		loadAuctionEndedListener();
	}, [auction]);

	useEffect(() => {
		if (endedConfirmationNeeded) {
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
				setEndedConfirmationNeeded(false);
			}, 3000);
		}
	}, [auctionComplete]);

	const handleEndAuction = async () => {
		try {
			setLoading(true);

			if (auction) await endAuction(auction.address);

			setTimeout(() => {
				setLoading(false);
				setAuctionComplete(true);
			}, 3000);
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
							<button onClick={handleEndAuction}>End Auction</button>
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
