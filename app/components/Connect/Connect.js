import React from 'react';
import Style from './Connect.module.scss';
import Image from 'next/image';

// INTERNAL IMPORTS
import images from '../../../assets/index';

const Connect = () => {
	return (
		<div className={Style.connect}>
			<div className={Style.connect_container}>
				<Image src={images.metamask} alt='Step image' className={Style.connect_container_image} />
				<p className={Style.connect_container_steps}>Step 1</p>
				<p className={Style.connect_container_instruction}>Connect Wallet</p>
				<p className={Style.connect_container_info}>
					Connect to the marketplace via metamask. Make sure you brought some ETH!
				</p>
			</div>
			<div className={Style.connect_container}>
				<Image src={images.filter} alt='Step image' className={Style.connect_container_image} />
				<p className={Style.connect_container_steps}>Step 2</p>
				<p className={Style.connect_container_instruction}>Filter & Discover</p>
				<p className={Style.connect_container_info}>
					Filter through the top trending NFTs. Discover classics like bored ape and pudgy penguins as well as new kids
					on the block.
				</p>
			</div>
			<div className={Style.connect_container}>
				<Image src={images.buy} alt='Step image' className={Style.connect_container_image} />
				<p className={Style.connect_container_steps}>Step 3</p>
				<p className={Style.connect_container_instruction}>Purchase NFTs</p>
				<p className={Style.connect_container_info}>
					Make the trade of your life and purchase one of these awesome collectibles.
				</p>
			</div>
			<div className={Style.connect_container}>
				<Image src={images.sell} alt='Step image' className={Style.connect_container_image} />
				<p className={Style.connect_container_steps}>Step 4</p>
				<p className={Style.connect_container_instruction}>Sell Your NFTs</p>
				<p className={Style.connect_container_info}>Sell your purchased NFTs on the open market and stack some ETH.</p>
			</div>
		</div>
	);
};

export default Connect;
