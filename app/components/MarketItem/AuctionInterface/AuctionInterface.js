import React, { useState } from 'react';
import Style from './AuctionInterface.module.scss';

import { FaInfoCircle, FaGavel } from 'react-icons/fa';

const AuctionInterface = ({
	setStartingPrice,
	setDuration,
	handleShowAuctionInfo,
	handleAuctionStart,
	isInfoVisible,
}) => {
	return (
		<div className={Style.card_auction}>
			<div className={Style.card_auction_info}>
				<p>Create Auction Listing</p>
				<FaInfoCircle className={Style.card_auction_info_icon} onClick={handleShowAuctionInfo} />
				<p className={`${Style.card_auction_info_more} ${isInfoVisible ? Style.visible : ''}`}>
					Please enter the auction start price in ETH and the time in Minutes. E.g. '2.5' & '60'
				</p>
			</div>
			<div className={Style.card_auction_list}>
				<input type='text' placeholder='(ETH): E.g. 2.5' onChange={(e) => setStartingPrice(e.target.value)} />
				<input type='text' placeholder='(Mins): E.g. 60' onChange={(e) => setDuration(e.target.value)} />
				<div className={Style.card_auction_list_wrapper} onClick={handleAuctionStart}>
					<FaGavel className={Style.card_auction_list_wrapper_icon} />
				</div>
			</div>
		</div>
	);
};

export default AuctionInterface;
