// EXTERNAL IMPORTS
import React, { useState, useEffect } from 'react';
import { RingLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { ref, get } from 'firebase/database';
import { realtimeDb } from '@/firebaseConfig';

// INTERNAL IMPORTS
import Style from './EndAuctionInterface.module.scss';
import {
	endAuction,
	listenForEndedAuctions,
	callAuctionEndTimeReached,
} from '@/store/blockchainInteractions';
import { AuctionTimer } from '../../componentindex';

const EndAuctionInterface = ({ id, setAuctionActive, resetUserData }) => {
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [auctionComplete, setAuctionComplete] = useState(false);

	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const auction = auctions.length > 0 ? auctions.find((auction) => auction.nftId === id) : {};

	useEffect(() => {
		checkIfEndTimeReached(id);
	}, []);

	useEffect(() => {
		const loadAuctionEndedListener = async () => {
			if (auction) {
				await listenForEndedAuctions(dispatch, auction.auctionAddress);
			}
		};
		auctions ? loadAuctionEndedListener() : setTimeout(() => loadAuctionEndedListener(), 3000);
	}, []);

	useEffect(() => {
		if (auctionComplete) {
			setTimeout(() => {
				setAuctionActive(false);
				resetUserData();
				setAuctionEnded(true);
			}, 3000);
		}
	}, [auctionComplete]);

	const handleEndAuction = async () => {
		try {
			setLoading(true);

			await endAuction(auction.auctionAddress);

			setTimeout(() => {
				setLoading(false);
				setAuctionComplete(true);
			}, 3000);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

	const handleEndTimeReached = async () => {
		try {
			setLoading(true);

			console.log('id', id, typeof id);

			await callAuctionEndTimeReached(dispatch, id, auction.auctionAddress);

			setTimeout(() => {
				setLoading(false);
				setAuctionComplete(true);
			}, 3000);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

	const checkIfEndTimeReached = async (id) => {
		const auctionsRef = ref(realtimeDb, 'auctions');
		const snapshot = await get(auctionsRef);
		if (snapshot.exists()) {
			const data = snapshot.val();
			const auctions = Object.values(data);
			const auction = auctions.find((auction) => auction.nftId === id);
			if (auction.startTime * 1000 + auction.auctionDuration * 1000 < Date.now()) {
				handleEndTimeReached();
			}
		}
	};

	return (
		<div className={Style.interface}>
			{auctionComplete ? (
				<div className={Style.interface_complete}>
					<p>Auction Ended</p>
					<span>
						<p>{auction.currentBid ? 'Winning Bid:' : 'Starting Price:'}</p>
						<p>
							{auction.currentBid ? auction.currentBid : auction.startingPrice}
							ETH
						</p>
					</span>
				</div>
			) : (
				<>
					<p className={Style.interface_active}>Auction Active</p>
					<div className={Style.interface_info}>
						<p>Ending:</p>
						<AuctionTimer
							startTime={auction.startTime}
							auctionDuration={auction.auctionDuration}
							handleEndTimeReached={handleEndTimeReached}
						/>
					</div>
					<div className={Style.interface_actions}>
						<div className={Style.interface_actions_bid}>
							<p>{auction.currentBid ? 'Current Bid:' : 'Starting Price:'}</p>
							<p>{auction.currentBid ? auction.currentBid : auction.startingPrice} ETH</p>
						</div>
						{loading ? (
							<RingLoader size={30} color={'#fff'} />
						) : (
							<button onClick={handleEndAuction}>End Auction</button>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default EndAuctionInterface;
