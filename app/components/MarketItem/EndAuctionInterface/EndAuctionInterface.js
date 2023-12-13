// EXTERNAL IMPORTS
import React, { useState, useEffect } from 'react';
import { RingLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';

// INTERNAL IMPORTS
import Style from './EndAuctionInterface.module.scss';
import { endAuction, listenForEndedAuctions } from '@/store/blockchainInteractions';
import { AuctionTimer } from '../../componentindex';

const EndAuctionInterface = ({ id }) => {
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
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

			setLoading(false);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

	return (
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
				) : (
					<button onClick={handleEndAuction}>End Auction</button>
				)}
			</div>
		</div>
	);
};

export default EndAuctionInterface;
