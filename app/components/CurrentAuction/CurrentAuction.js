import React from 'react';
import Style from './CurrentAuction.module.scss';
import Image from 'next/image';

import { FaArrowLeft, FaArrowRight, FaUserCircle } from 'react-icons/fa';
import { MdTimer } from 'react-icons/md';

// INTERNAL IMPORTS
import images from '../../../assets/index';

const CurrentAuction = () => {
	return (
		<div className={Style.auction}>
			<div className={Style.auction_container}>
				<div className={Style.auction_container_title}>
					<h1>Mutant Ape Yacht Club</h1>
					<div className={Style.auction_container_title_container}>
						<FaArrowLeft size={38} className={Style.auction_container_title_container_arrows} />
						<FaArrowRight size={38} className={Style.auction_container_title_container_arrows} />
					</div>
				</div>
				<div className={Style.auction_container_wrapper}>
					<div className={Style.auction_container_wrapper_creator}>
						<FaUserCircle size={38} className={Style.auction_container_wrapper_creator_img} />
						<p>Creator</p>
						<p>James Kane</p>
					</div>
					<br className={Style.br} />
					<div className={Style.auction_container_wrapper_collection}>
						<FaUserCircle size={38} className={Style.auction_container_wrapper_creator_img} />
						<p>Collection</p>
						<p>Miscellaneous</p>
					</div>
				</div>
				<div className={Style.auction_container_bid}>
					<p>Current Bid: </p>
					<p>100 ETH</p>
				</div>
				<div className={Style.auction_container_time}>
					<div className={Style.auction_container_time_duration}>
						<MdTimer size={38} />
						<p>Auction Ending In:</p>
					</div>
					<div className={Style.auction_container_time_remaining}>
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
					</div>
					<br />
					<div className={Style.auction_container_interact}>
						<button className={Style.auction_container_interact_btn}>Bid</button>
						<button className={Style.auction_container_interact_btn}>Info</button>
					</div>
				</div>
			</div>
			<div className={Style.auction_nft}></div>
		</div>
	);
};

export default CurrentAuction;
