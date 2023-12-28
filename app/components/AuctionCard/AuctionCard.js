'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { FaHeart, FaCheck } from 'react-icons/fa';
import { RingLoader } from 'react-spinners';
import { ethers } from 'ethers';

// BLOCKCHAIN + BACKEND IMPORTS
import { deleteField, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ref, get } from 'firebase/database';
import { realtimeDb } from '@/firebaseConfig';

// INTERNAL IMPORTS
import Style from './AuctionCard.module.scss';
import images from '../../../assets/index';
import { AuctionTimer } from '../componentindex';
import {
	callAuctionEndTimeReached,
	listenForBidEvents,
	listenForEndedAuctions,
	placeBid,
} from '@/store/blockchainInteractions';

const AuctionCard = ({
	id,
	image,
	name,
	category,
	price,
	isListed,
	resetUserData,
	checkEndedAuctions,
}) => {
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [bidding, setBidding] = useState(false);
	const [bidAmount, setBidAmount] = useState(null);
	const [inWatchlist, setInWatchlist] = useState(false);
	const [auctionComplete, setAuctionComplete] = useState(false);

	const user = useSelector((state) => state.connection.account);
	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const auction = auctions.length > 0 ? auctions.find((auction) => auction.nftId === id) : {};

	// Check if any auctions have ended on page load
	useEffect(() => {
		checkIfEndTimeReached(id);
	}, []);

	// Listen for auction events
	useEffect(() => {
		let cleanupFuncs = [];

		const loadAuctionEventListeners = async () => {
			const cleanup1 = await listenForEndedAuctions(dispatch, auction.auctionAddress);
			const cleanup2 = await listenForBidEvents(dispatch, auction.auctionAddress, auction.nftId);
			cleanupFuncs = [cleanup1, cleanup2];
		};

		loadAuctionEventListeners();

		// Cleanup functions are called when the component is unmounted
		return () => {
			cleanupFuncs.forEach((cleanup) => cleanup());
		};
	}, []);

	useEffect(() => {
		const checkWatchlistStatus = async () => {
			const userRef = doc(db, 'users', user.account);
			const userDoc = await getDoc(userRef);
			if (userDoc.exists()) {
				const data = userDoc.data();
				data.watchlist[id] ? setInWatchlist(true) : setInWatchlist(false);
			}
		};
		checkWatchlistStatus();
	}, []);

	useEffect(() => {
		if (auctionComplete) {
			resetUserData();
			checkEndedAuctions();
		}
	}, [auctionComplete]);

	/**
	 * Handles the logic when the auction end time is reached.
	 * Initiates loading screen, calls the 'callAuctionEndTimeReached',
	 * Sets the loading state to false and triggers re-render.
	 * @returns {Promise<void>} A promise that resolves when the auction end time is reached.
	 * @throws {Error} If there is an error ending the auction.
	 */
	const handleEndTimeReached = async () => {
		try {
			setLoading(true);

			await callAuctionEndTimeReached(dispatch, id);

			setTimeout(() => {
				setLoading(false);
				setAuctionComplete(true);
			}, 5000);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

	/**
	 * Toggles the watchlist status of an auction.
	 * If the auction is not in the watchlist, it adds it.
	 * If the auction is already in the watchlist, it removes it.
	 * @returns {Promise<void>} A promise that resolves when the watchlist status is updated.
	 */
	const handleWatchlistToggle = async () => {
		const userRef = doc(db, 'users', user.account);

		if (!inWatchlist) {
			const nftData = {
				id: id,
				name: name,
				image: image,
				category: category,
				price: price,
				isListed: isListed,
			};

			if (userRef) {
				await updateDoc(userRef, {
					[`watchlist.${id}`]: nftData,
				});
				setInWatchlist(true);
			} else {
				console.log('Reference to user does not exist');
			}
		} else {
			await updateDoc(userRef, {
				[`watchlist.${id}`]: deleteField(),
			});
			setInWatchlist(false);
		}
	};

	const handleSetBid = () => {
		setBidding(!bidding);
	};

	/**
	 * Handles the process of placing a bid on an auction.
	 * @async
	 * @function handleAuctionBid
	 * @returns {Promise<void>}
	 * @throws {Error} If failed to place bid on auction.
	 */
	const handleAuctionBid = async () => {
		try {
			setLoading(true);
			await placeBid(auction.auctionAddress, bidAmount);

			setTimeout(() => {
				setLoading(false);
				handleSetBid();
			}, 1500);
		} catch (error) {
			console.error('Failed to place bid on auction.');
		}
	};

	/**
	 * Checks if the end time of an auction has been reached for a given ID.
	 * If the end time has been reached, it calls the handleEndTimeReached function.
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
		<div className={Style.card}>
			<div className={Style.card_img}>
				<Image
					src={image ? image : images.placeholder}
					alt='live auction nft image'
					width={330}
					height={330}
					className={Style.card_img_image}
				/>
				<button className={Style.card_img_wrapper} onClick={handleWatchlistToggle}>
					<FaHeart
						size={18}
						className={Style.card_img_like}
						color={inWatchlist ? 'red' : 'white'}
					/>
				</button>
				<div className={Style.card_img_name}>
					<p>{name}</p>
				</div>
			</div>

			<div className={Style.interface}>
				{auctionComplete ? (
					<div className={Style.interface_complete}>
						<p>Auction Ended</p>
						<span>
							<p>{auction.currentBid ? 'Winning Bid:' : 'Starting Price - No Bids:'}</p>
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
								<p>{auction.currentBid ? 'Current Bid:' : 'Price:'}</p>
								<p>{auction.currentBid ? auction.currentBid : auction.startingPrice}</p>
								<p>ETH</p>
							</div>
							{loading ? (
								<RingLoader size={30} color={'#fff'} />
							) : bidding ? (
								<div className={Style.interface_actions_place}>
									<input
										type='text'
										placeholder='E.g. 1.25'
										onChange={(e) => setBidAmount(e.target.value)}
									/>
									<button onClick={handleAuctionBid}>
										<FaCheck className={Style.interface_actions_place_confirm} />
									</button>
								</div>
							) : (
								<>
									{user &&
									auction &&
									user.account.toLowerCase() === auction.sellerAddress.toLowerCase() ? (
										<button className={Style.disabled} disabled>
											Your NFT
										</button>
									) : (
										<button onClick={handleSetBid}>Place Bid</button>
									)}
								</>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default AuctionCard;
