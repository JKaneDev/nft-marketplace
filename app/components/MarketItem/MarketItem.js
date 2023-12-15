'use client';

import React, { useState, useEffect } from 'react';
import Style from './MarketItem.module.scss';
import Image from 'next/image';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { createAuction, createContractInstance } from '@/store/blockchainInteractions';
import { useSelector, useDispatch } from 'react-redux';

// INTERNAL IMPORTS
import images from '../../../assets/index';
import { NFTInfo, AuctionInterface, EndAuctionInterface } from '../componentindex';

const MarketItem = ({ id, name, image, price, category, isListed, resetUserData }) => {
	const dispatch = useDispatch();

	const user = useSelector((state) => state.connection.account);
	const auctionFactoryDetails = useSelector((state) => state.auctionFactory.contractDetails);

	const [loading, setLoading] = useState(false);
	const [isInfoVisible, setIsInfoVisible] = useState(false);

	const [startingPrice, setStartingPrice] = useState('');
	const [duration, setDuration] = useState('');

	const [auctionActive, setAuctionActive] = useState(false);
	const [auctionStarted, setAuctionStarted] = useState(false);
	const [auctionEnded, setAuctionEnded] = useState(false);

	useEffect(() => {
		checkForActiveAuction(id);
	}, []);

	useEffect(() => {
		if (auctionStarted === true) {
			window.location.reload();
		}
	}, [auctionStarted]);

	useEffect(() => {
		if (auctionEnded === true) {
			window.location.reload();
		}
	}, [auctionEnded]);

	const handleShowAuctionInfo = (e) => {
		setIsInfoVisible(!isInfoVisible);
	};

	const checkForActiveAuction = async () => {
		const contract = await createContractInstance(auctionFactoryDetails);
		const activeAuctions = await contract.getActiveAuctionIds();
		const activeAuctionIds = activeAuctions.map((id) => id.toString());
		const isAuctionActive = activeAuctionIds.includes(id);
		setAuctionActive(isAuctionActive);
	};

	const handleAuctionStart = async () => {
		setLoading(true);
		const contract = await createContractInstance(auctionFactoryDetails);
		await createAuction(contract, startingPrice, duration, id, user.account);
		setTimeout(() => {
			setLoading(false);
			setAuctionStarted(true);
		}, 3000);
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

			{isListed && auctionActive ? (
				<EndAuctionInterface id={id} setAuctionEnded={setAuctionEnded} />
			) : isListed ? (
				<NFTInfo
					id={id}
					name={name}
					price={price}
					category={category}
					resetUserData={resetUserData}
				/>
			) : (
				// <span>Hello</span>
				<AuctionInterface
					loading={loading}
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
