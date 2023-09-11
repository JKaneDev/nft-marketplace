import React from 'react';
import Style from './CurrentAuction.module.scss';
import Image from 'next/image';

import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// INTERNAL IMPORTS
import images from '../../../assets/index';

const CurrentAuction = () => {
	return (
		<div className={Style.auction}>
			<div className={Style.auction_container}>
				<div className={Style.auction_container_title}>
					<h1>Mutant Ape Yacht Club</h1>
					<FaArrowLeft />
					<FaArrowRight />
				</div>
				<div className={Style.auction_container_creator}>
					<p>Creator</p>
					<p>James Kane</p>
				</div>
				<div className={Style.auction_container_collection}>
					<p>Collection</p>
					<p>Miscellaneous</p>
				</div>
				<div className={Style.auction_container_bid}>
					<p>Current Bid</p>
					<p>100 ETH</p>
				</div>
				<div className={Style.auction_container_time}>
					<div className={Style.auction_container_time_display}>
						<p>3</p>
						<p>Days</p>
					</div>
					<div className={Style.auction_container_time_display}>
						<p>16</p>
						<p>Hours</p>
					</div>
					<div className={Style.auction_container_time_display}>
						<p>32</p>
						<p>Mins</p>
					</div>
					<div className={Style.auction_container_time_display}>
						<p>10</p>
						<p>Secs</p>
					</div>
					<br />
					<div className={Style.auction_container_interact}>
						<button className={Style.auction_container_interact_btn}>Place Bid</button>
						<button className={Style.auction_container_interact_btn}>Details</button>
					</div>
				</div>
			</div>
			<div className={Style.auction_nft}></div>
		</div>
	);
};

export default CurrentAuction;
