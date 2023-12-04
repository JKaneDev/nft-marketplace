'use client';

import React, { useState } from 'react';
import Style from './NFTCard.module.scss';
import Image from 'next/image';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { createAuction, loadAuctionFactoryContract } from '@/store/blockchainInteractions';
import { Dispatch } from '@reduxjs/toolkit';

// INTERNAL IMPORTS
import images from '../../../assets/index';

import { FaGavel, FaInfoCircle } from 'react-icons/fa';

const NFTCard = ({ name, image }) => {
	const [isInfoVisible, setIsInfoVisible] = useState(false);
	const [startingPrice, setStartingPrice] = useState('');
	const [duration, setDuration] = useState('');

	const handleShowAuctionInfo = (e) => {
		setIsInfoVisible(!isInfoVisible);
	};

	const handleAuctionStart = async () => {
		const contract = await loadAuctionFactoryContract(dispatch);
		await createAuction(startingPrice, auctionDuration);
	};

	return (
		<div className={Style.card}>
			<div className={Style.card_img}>
				<Image
					src={image ? image : images.mape2}
					alt='live auction nft image'
					className={Style.card_img_image}
					width={330}
					height={330}
				/>
				<div className={Style.card_img_name}>
					<p>{name ? name : 'Mutant Ape'}</p>
				</div>
			</div>

			<div className={Style.card_auction}>
				<div className={Style.card_auction_info}>
					<p>Create Auction Listing</p>
					<FaInfoCircle className={Style.card_auction_info_icon} onClick={handleShowAuctionInfo} />
					<p className={`${Style.card_auction_info_more} ${isInfoVisible ? Style.visible : ''}`}>
						Please enter the auction start price in ETH and the time in Minutes. E.g. '2.5' & '60'
					</p>
				</div>
				<div className={Style.card_auction_list}>
					<input type='text' placeholder='(ETH): E.g. 2.5' />
					<input type='text' placeholder='(Mins): E.g. 60' />
					<div className={Style.card_auction_list_wrapper}>
						<FaGavel className={Style.card_auction_list_wrapper_icon} onClick={handleAuctionStart} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default NFTCard;
