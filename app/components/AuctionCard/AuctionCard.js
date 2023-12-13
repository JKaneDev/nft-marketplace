'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';

import { FaHeart, FaCheck } from 'react-icons/fa';

// INTERNAL IMPORTS
import Style from './AuctionCard.module.scss';
import images from '../../../assets/index';
import { AuctionTimer } from '../componentindex';
import { endAuction } from '@/store/blockchainInteractions';

const AuctionCard = ({ id, image, name }) => {
	const [loading, setLoading] = useState(false);
	const [bidding, setBidding] = useState(false);
	const [bidAmount, setBidAmount] = useState(null);

	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const auctionData = auctions.find((auction) => auction.nftId === id);

	const handleEndAuction = async () => {
		try {
			setLoading(true);

			await endAuction(auctionData.nftId, auctionData.sellerAddress, auctionData.auctionAddress);

			setLoading(false);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

	const handleSetBid = () => {
		setBidding(!bidding);
	};

	const handleAuctionBid = (amount) => {
		return;
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
						startTime={auctionData.startTime}
						auctionDuration={auctionData.auctionDuration}
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
							<input type='text' onChange={(e) => setBidAmount(e.target.value)} />
							<button>
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
