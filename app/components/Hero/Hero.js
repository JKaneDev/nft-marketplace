import React from 'react';
import Style from './Hero.module.scss';
import Image from 'next/image';
import Link from 'next/link';

// INTERNAL IMPORTS
import images from '../../../assets/index';

const Hero = () => {
	return (
		<div className={Style.hero}>
			<div className={Style.hero_container}>
				<h1>Discover, Collect & Sell NFTs</h1>
				<p>
					Discover trending NFTs of all styles and flavours, including classics like Bored Ape Yacht
					Club, Azuki, Pudgy Penguins and more! Just connect your wallet and gain access to a
					universe of digital collectible treasure. Create your own NFTs and sell them on the open
					market.
				</p>
				<Link href={{ pathname: 'search-marketplace' }} className={Style.hero_container_button}>
					Search Marketplace
				</Link>
			</div>
			<div className={Style.hero_wrapper}>
				<div className={Style.hero_image}>
					<Image src={images.mape1} alt='hero image' className={Style.hero_image_images} />
					<Image src={images.ape2} alt='hero image' className={Style.hero_image_images} />
					<Image src={images.pudgy1} alt='hero image' className={Style.hero_image_images} />
				</div>
			</div>
		</div>
	);
};

export default Hero;
