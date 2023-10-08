'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

import { FaHeart, FaTimes } from 'react-icons/fa';

// INTERNAL IMPORTS
import Style from './AuctionCard.module.scss';
import images from '../../../assets/index';

const AuctionCard = () => {
	const [isBidding, setIsBidding] = useState(false);

	useEffect(() => {
		console.log(isBidding);
	}, [isBidding]);

	return (
		<div className={Style.card}>
			<div className={Style.card_img}>
				<Image src={images.mape2} alt='live auction nft image' className={Style.card_img_image} />
				<div className={Style.card_img_wrapper}>
					<FaHeart size={18} className={Style.card_img_like} />
					<p>25</p>
				</div>
				<div className={Style.card_img_name}>
					<p>Mutant Ape</p>
				</div>
			</div>

			<div className={Style.card_wrapper}>
				{isBidding ? (
					<div className={Style.card_wrapper_interface}>
						<span className={Style.card_wrapper_interface_exit} onClick={() => setIsBidding(!isBidding)}>
							<FaTimes className={Style.card_wrapper_interface_exit_icon} />
						</span>
						<input type='text' className={Style.card_wrapper_interface_bid} />
						<button className={Style.card_wrapper_interface_place}>Bid</button>
					</div>
				) : (
					<div className={Style.card_wrapper_bid}>
						<p onClick={() => setIsBidding(!isBidding)}>Current Bid:</p>
						<p>1.5 ETH</p>
					</div>
				)}

				<div className={Style.card_wrapper_time}>
					<p>Time Remaining:</p>
					<p>8h:22m:43s</p>
				</div>
			</div>

			<div className={Style.card_bid}>
				<div className={Style.card_bid_current}>
					<p>Current Bid:</p>
					<p>1.5 ETH</p>
				</div>
				<div className={Style.card_bid_wrapper}>
					<input type='text' className={Style.card_bid_wrapper_amount} />
					<button className={Style.card_bid__wrapper_place}>Place Bid</button>
				</div>
			</div>
		</div>
	);
};

export default AuctionCard;
