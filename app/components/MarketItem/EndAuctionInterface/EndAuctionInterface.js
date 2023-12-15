// EXTERNAL IMPORTS
import React, { useState, useEffect } from 'react';
import { RingLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';

// INTERNAL IMPORTS
import Style from './EndAuctionInterface.module.scss';
import {
	endAuction,
	listenForEndedAuctions,
	callEndAuctionOnComplete,
} from '@/store/blockchainInteractions';
import { AuctionTimer } from '../../componentindex';
import { ethers } from 'ethers';

const EndAuctionInterface = ({ id }) => {
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [auctionComplete, setAuctionComplete] = useState(false);

	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const auction = auctions.length > 0 ? auctions.find((auction) => auction.nftId === id) : {};

	useEffect(() => {
		const loadAuctionEndedListener = async () => {
			if (auction) {
				await listenForEndedAuctions(dispatch, auction.sellerAddress, auction.auctionAddress);
			}
		};
		loadAuctionEndedListener();
	}, []);

	const handleEndAuction = async () => {
		try {
			setLoading(true);

			await endAuction(auction.nftId, auction.auctionAddress);

			setTimeout(() => {
				setLoading(false);
				setAuctionComplete(true);
			}, 1500);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

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

	return (
		<div className={Style.interface}>
			{auctionComplete ? (
				<div className={Style.interface_complete}>
					<p>Auction Ended</p>
					<span>
						<p>{auction.currentBid ? 'Winning Bid:' : 'Starting Price - No Bids:'}</p>
						<p>
							{auction.currentBid ? auction.currentBid : ethers.formatEther(auction.startingPrice)}
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
							<p>{auction.currentBid ? 'Current Bid: ' : 'Starting Price: '}</p>
							<p>
								{auction.currentBid
									? auction.currentBid
									: ethers.formatEther(auction.startingPrice)}{' '}
								ETH
							</p>
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
