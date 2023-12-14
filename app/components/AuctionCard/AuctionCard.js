'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';

import { FaHeart, FaCheck } from 'react-icons/fa';
import { RingLoader } from 'react-spinners';

// INTERNAL IMPORTS
import Style from './AuctionCard.module.scss';
import images from '../../../assets/index';
import { AuctionTimer } from '../componentindex';
import {
	endAuction,
	listenForBidEvents,
	listenForEndedAuctions,
	loadActiveAuctions,
	placeBid,
} from '@/store/blockchainInteractions';

const AuctionCard = ({ id, image, name }) => {
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [bidding, setBidding] = useState(false);
	const [bidAmount, setBidAmount] = useState(null);

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

	const handleEndAuction = async () => {
		try {
			setLoading(true);

			await endAuction(auction.nftId, auction.sellerAddress, auction.auctionAddress);

			setLoading(false);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

	const handleSetBid = () => {
		setBidding(!bidding);
	};

	const handleAuctionBid = async () => {
		try {
			setLoading(true);
			await placeBid(auction.auctionAddress, bidAmount);

			setLoading(false);
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
				<div className={Style.card_img_wrapper}>
					<FaHeart size={18} className={Style.card_img_like} />
				</div>
				<div className={Style.card_img_name}>
					<p>{name}</p>
				</div>
			</div>

			<div className={Style.interface}>
				<p className={Style.interface_active}>Auction Active</p>
				<div className={Style.interface_info}>
					<p>Ending:</p>
					<AuctionTimer
						startTime={auction.startTime}
						auctionDuration={auction.auctionDuration}
						handleEndAuction={handleEndAuction}
					/>
				</div>
				<div className={Style.interface_actions}>
					<div className={Style.interface_actions_bid}>
						<p>Current Bid:</p>
						<p>1 ETH</p>
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
			</div>
		</div>
	);
};

export default AuctionCard;
