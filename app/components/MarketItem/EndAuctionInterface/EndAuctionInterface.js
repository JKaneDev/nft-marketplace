// EXTERNAL IMPORTS
import React, { useState, useEffect } from 'react';
import { RingLoader } from 'react-spinners';
import { useSelector } from 'react-redux';
import moment from 'moment';

// INTERNAL IMPORTS
import Style from './EndAuctionInterface.module.scss';
import { endAuction } from '@/store/blockchainInteractions';
import { AuctionTimer } from '../../componentindex';

const EndAuctionInterface = ({ auctionData }) => {
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		console.log('AuctionData: ', auctionData);
	});

	const handleEndAuction = async () => {
		try {
			setLoading(true);

			await endAuction(auctionData.nftId);

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
				{loading ? <RingLoader size={30} color={'#fff'} /> : <button onClick={handleEndAuction}>End Auction</button>}
			</div>
		</div>
	);
};

export default EndAuctionInterface;
