import React from 'react';
import Image from 'next/image';

import { FaHeart } from 'react-icons/fa';

// INTERNAL IMPORTS
import Style from './AuctionCard.module.scss';
import images from '../../../assets/index';

const AuctionCard = () => {
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
				<div className={Style.card_wrapper_bid}>
					<p>Current Bid:</p>
					<p>1.5 ETH</p>
				</div>
				<div className={Style.card_wrapper_time}>
					<p>Time Remaining:</p>
					<p>8h:22m:43s</p>
				</div>
			</div>
		</div>
	);
};

export default AuctionCard;
