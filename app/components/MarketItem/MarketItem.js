'use client';

import React, { useState } from 'react';
import Style from './MarketItem.module.scss';
import Image from 'next/image';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { createAuction, createContractInstance } from '@/store/blockchainInteractions';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import AuctionInterface from './AuctionInterface/AuctionInterface';

// INTERNAL IMPORTS
import images from '../../../assets/index';
import { NFTInfo } from '../componentindex';

const MarketItem = ({ id, name, image, price, category, isListed }) => {
	const user = useSelector((state) => state.connection.account);
	const contractDetails = useSelector((state) => state.auctionFactory.contractDetails);

	const [isInfoVisible, setIsInfoVisible] = useState(false);
	const [startingPrice, setStartingPrice] = useState('');
	const [duration, setDuration] = useState('');

	const handleShowAuctionInfo = (e) => {
		setIsInfoVisible(!isInfoVisible);
	};

	const handleAuctionStart = async () => {
		const contract = await createContractInstance(contractDetails, user);
		await createAuction(contract, startingPrice, duration, id);
	};

	return (
		<div className={Style.card}>
			<div className={Style.card_img}>
				<Image
					src={image ? image : images.placeholder}
					alt='live auction nft image'
					className={Style.card_img_image}
					width={330}
					height={330}
				/>

				<div className={Style.card_img_name}>
					<p>{name ? name : 'Placeholder NFT'}</p>
				</div>
			</div>

			{isListed ? (
				<NFTInfo id={id} name={name} price={price} category={category} />
			) : (
				// <span>Hello</span>
				<AuctionInterface
					isInfoVisible={isInfoVisible}
					setStartingPrice={setStartingPrice}
					setDuration={setDuration}
					handleShowAuctionInfo={handleShowAuctionInfo}
					handleAuctionStart={handleAuctionStart}
				/>
			)}
		</div>
	);
};

export default MarketItem;
