'use client';

import React, { useState } from 'react';
import Style from './MarketItem.module.scss';
import Image from 'next/image';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { createAuction, loadAuctionFactoryContract } from '@/store/blockchainInteractions';
import { useDispatch } from 'react-redux';
import AuctionInterface from '../AuctionInterface/AuctionInterface';

// INTERNAL IMPORTS
import images from '../../../assets/index';

const MarketItem = ({ id, name, image, price }) => {
	const dispatch = useDispatch();

	const [isInfoVisible, setIsInfoVisible] = useState(false);
	const [startingPrice, setStartingPrice] = useState('');
	const [duration, setDuration] = useState('');

	const handleShowAuctionInfo = (e) => {
		setIsInfoVisible(!isInfoVisible);
	};

	const handleAuctionStart = async () => {
		const contract = await loadAuctionFactoryContract(dispatch);
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

			<AuctionInterface
				isInfoVisible={isInfoVisible}
				setStartingPrice={setStartingPrice}
				setDuration={setDuration}
				handleShowAuctionInfo={handleShowAuctionInfo}
				handleAuctionStart={handleAuctionStart}
			/>
		</div>
	);
};

export default MarketItem;
