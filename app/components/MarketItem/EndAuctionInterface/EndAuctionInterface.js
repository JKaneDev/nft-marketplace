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
	}, [id]);

	/**
	 * Loads the auction factory functions by creating a contract instance, listening for created auctions,
	 * and loading active auctions.
	 */
	useEffect(() => {
		let cleanupFunc = () => {};

		const loadAuctionEndedListener = async () => {
			if (auction) {
				cleanupFunc = await listenForEndedAuctions(dispatch, auction.auctionAddress);
			}
		};

		auctions ? loadAuctionEndedListener() : setTimeout(() => loadAuctionEndedListener(), 3000);

		return () => {
			cleanupFunc();
		};
	}, []);

	useEffect(() => {
		if (auctionComplete) {
			setTimeout(() => {
				setAuctionActive(false);
				resetUserData();
			}, 7000);
		}
	}, [auctionComplete]);

	/**
	 * Handles the end of an auction by calling the endAuction function and updating the state accordingly.
	 * Sets the loading state to true, ends the auction, and then sets the loading state to false and marks
	 * the auction as complete after a delay.
	 * @throws {Error} If there is an error ending the auction.
	 */
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

	/**
	 * Handles the event when the auction end time is reached.
	 * This function calls the 'callAuctionEndTimeReached' function with the nft ID,
	 * sets the loading state to true, and then sets a timeout to set the loading state to false
	 * @returns {Promise<void>} A promise that resolves when the auction end time is handled successfully.
	 * @throws {Error} If there is an error ending the auction.
	 */
	const handleEndTimeReached = async () => {
		try {
			setLoading(true);

			await callAuctionEndTimeReached(dispatch, id);

			setTimeout(() => {
				setLoading(false);
				setAuctionComplete(true);
			}, 3000);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

	/**
	 * Checks if the end time of an auction has been reached for a given ID.
	 * If the end time has been reached, it calls the handleEndTimeReached function,
	 * which confirms the auction end and allows any user to end the auction.
	 * @param {string} id - The ID of the auction to check.
	 * @returns {Promise<void>} - A promise that resolves when the check is complete.
	 */
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
