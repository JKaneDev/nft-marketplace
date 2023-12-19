'use client';

import React, { useState, useEffect } from 'react';
import Style from './MarketItem.module.scss';
import Image from 'next/image';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import {
	createAuction,
	createContractInstance,
	loadActiveAuctions,
} from '@/store/blockchainInteractions';
import { useDispatch, useSelector } from 'react-redux';

// INTERNAL IMPORTS
import images from '../../../assets/index';
import {
	NFTInfo,
	AuctionInterface,
	EndAuctionInterface,
	CreateStaticSale,
} from '../componentindex';
import SaleToggle from './SaleToggle';

const MarketItem = ({ id, name, image, price, category, isListed, resetUserData }) => {
	const dispatch = useDispatch();

	const user = useSelector((state) => state.connection.account);
	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const auctionFactoryDetails = useSelector((state) => state.auctionFactory.contractDetails);

	const [loading, setLoading] = useState(false);
	const [isInfoVisible, setIsInfoVisible] = useState(false);

	const [startingPrice, setStartingPrice] = useState('');
	const [duration, setDuration] = useState('');

	const [saleType, setSaleType] = useState('auction');
	const [auctionActive, setAuctionActive] = useState(false);
	const [auctionStarted, setAuctionStarted] = useState(false);

	useEffect(() => {
		checkForActiveAuction(id);
	}, []);

	useEffect(() => {
		if (auctionStarted) {
			reloadAuctionData();
		}
	}, [auctionStarted]);

	const reloadAuctionData = async () => {
		await loadActiveAuctions(dispatch);
		checkForActiveAuction(id);
		resetUserData();
	};

	const handleShowAuctionInfo = (e) => {
		setIsInfoVisible(!isInfoVisible);
	};

	const checkForActiveAuction = () => {
		const auctionIds = auctions.map((auction) => auction.nftId);
		const isAuctionActive = auctionIds.includes(id);
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
			<>{!isListed ? <SaleToggle saleType={saleType} setSaleType={setSaleType} /> : <></>}</>
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
				<EndAuctionInterface
					id={id}
					resetUserData={resetUserData}
					setAuctionActive={setAuctionActive}
				/>
			) : isListed ? (
				<NFTInfo
					id={id}
					name={name}
					price={price}
					category={category}
					resetUserData={resetUserData}
				/>
			) : saleType === 'static' ? (
				<CreateStaticSale
					id={id}
					name={name}
					price={price}
					category={category}
					resetUserData={resetUserData}
				/>
			) : (
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
