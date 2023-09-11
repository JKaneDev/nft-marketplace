import React from 'react';
import Style from './Hero.module.scss';
import Image from 'next/image';

// INTERNAL IMPORTS
import images from '../../../assets/index';

const Hero = () => {
	return (
		<div className={Style.hero}>
			<div className={Style.hero_container}>
				<h1>Discover, Collect & Sell NFTs</h1>
				<p>
					Discover trending NFTs of all styles and flavours, including classics like Bored Ape Yacht Club, Azuki, Pudgy
					Penguins and more! Just connect your wallet and gain access to a universe of digital collectible treasure.
					Create your own NFTs and sell them on the open market.
				</p>
				<button className={Style.hero_container_button}>Search Marketplace</button>
			</div>
			<div className={Style.hero_image}>
				<Image src={images.hero} alt='hero image' className={Style.hero_image_images} />
			</div>
		</div>
	);
};

export default Hero;
