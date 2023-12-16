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

// INTERNAL IMPORTS
import Style from './AuctionCard.module.scss';
import images from '../../../assets/index';
import { AuctionTimer } from '../componentindex';
import {
	callEndAuctionOnComplete,
	listenForBidEvents,
	listenForEndedAuctions,
	placeBid,
} from '@/store/blockchainInteractions';

const AuctionCard = ({ id, image, name, category, price, isListed }) => {
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [bidding, setBidding] = useState(false);
	const [bidAmount, setBidAmount] = useState(null);
	const [inWatchlist, setInWatchlist] = useState(false);
	const [auctionComplete, setAuctionComplete] = useState(false);

	const user = useSelector((state) => state.connection.account);
	const marketplaceDetails = useSelector((state) => state.marketplace.contractDetails);
	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const auction = auctions.length > 0 ? auctions.find((auction) => auction.nftId === id) : {};

	// Listen for auction events
	useEffect(() => {
		const loadAuctionEventListeners = async () => {
			if (auctions.length > 0) {
				const auction = auctions.find((auction) => auction.nftId === id);
				if (auction) {
					await listenForEndedAuctions(dispatch, auction.sellerAddress, auction.auctionAddress);
					await listenForBidEvents(dispatch, auction.auctionAddress, auction.nftId);
				}
			}
		};
		loadAuctionEventListeners();
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

	const handleEndTimeReached = async () => {
		try {
			setLoading(true);

			setAuctionComplete(true);

			await callEndAuctionOnComplete(marketplaceDetails, auction.auctionAddress, id);

			setTimeout(() => {
				setLoading(false);
			}, 1500);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

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
				console.log('User Ref found: ', userRef);
				console.log('Data object: ', nftData);
				await updateDoc(userRef, {
					[`watchlist.${id}`]: nftData,
				});
				setInWatchlist(true);
				console.log(`Watchlist item ${name} added`);
			} else {
				console.log('Reference to user does not exist');
			}
		} else {
			await updateDoc(userRef, {
				[`watchlist.${id}`]: deleteField(),
			});
			setInWatchlist(false);
			console.log(`Watchlist item ${name} removed`);
		}
	};

	const handleSetBid = () => {
		setBidding(!bidding);
	};

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
								{auction.currentBid
									? auction.currentBid
									: ethers.formatEther(auction.startingPrice)}
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
								<p>
									{auction.currentBid
										? auction.currentBid
										: ethers.formatEther(auction.startingPrice)}
									ETH
								</p>
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
								<button onClick={handleSetBid}>Place Bid</button>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default AuctionCard;
