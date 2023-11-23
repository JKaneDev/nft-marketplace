'use client';

import React from 'react';
import Style from './NFTCard.module.scss';
import Image from 'next/image';

import images from '../../../assets/index';

const NFTCard = ({ id, name, price, category, image }) => {
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
				<p>Create Auction Listing</p>
				<div className={Style.card_auction_list}>
					<input type='text' placeholder='Sale Price' />
					<button className={Style.card_auction_list_btn}>List</button>
				</div>
			</div>
		</div>
	);
};

export default NFTCard;
