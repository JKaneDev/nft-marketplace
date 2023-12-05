'use client';

import React, { useState } from 'react';
import Style from './NFTCard.module.scss';
import Image from 'next/image';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { createAuction, getSignerAddress, loadAuctionFactoryContract } from '@/store/blockchainInteractions';
import { useDispatch } from 'react-redux';

// INTERNAL IMPORTS
import images from '../../../assets/index';

import { FaGavel, FaInfoCircle } from 'react-icons/fa';

const NFTCard = ({ id, name, image }) => {
	const dispatch = useDispatch();

	const [isInfoVisible, setIsInfoVisible] = useState(false);
	const [startingPrice, setStartingPrice] = useState('');
	const [duration, setDuration] = useState('');

	const handleShowAuctionInfo = (e) => {
		setIsInfoVisible(!isInfoVisible);
	};

	const handleAuctionStart = async () => {
		console.log('Auction Sequence Initialized');
		const contract = await loadAuctionFactoryContract(dispatch);
		console.log('Data before auction call: ', {
			contract,
			startingPrice,
			duration,
			id,
		});
		await createAuction(contract, startingPrice, duration, id);
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
					<input type='text' placeholder='(ETH): E.g. 2.5' onChange={(e) => setStartingPrice(e.target.value)} />
					<input type='text' placeholder='(Mins): E.g. 60' onChange={(e) => setDuration(e.target.value)} />
					<div className={Style.card_auction_list_wrapper} onClick={handleAuctionStart}>
						<FaGavel className={Style.card_auction_list_wrapper_icon} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default NFTCard;
