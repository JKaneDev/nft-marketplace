import React from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './About.module.scss';
import images from '../../../assets/index';

const About = () => {
	return (
		<div className={Style.main}>
			<div className={Style.main_about}>
				<div className={Style.main_about_info}>
					<h1>About Us</h1>
					<p>
						We're a fully decentralized protocol currently rising as one of the most popular marketplaces for all of
						your favorite NFTs. Our team is dedicated to providing you with the best UX in the crypto-sphere. Have a
						look at our innovative and passionate team below. We've hired some of the best talent in the industry!
					</p>
				</div>
				<div className={Style.main_about_wrapper}>
					<Image src={images.ape1} alt='NFT 1' className={Style.main_about_wrapper_image} />
					<Image src={images.mape2} alt='NFT 1' className={Style.main_about_wrapper_image} />
					<Image src={images.pudgy1} alt='NFT 1' className={Style.main_about_wrapper_image} />
				</div>
			</div>
			<div className={Style.main_founders}>
				<div className={Style.main_founders_info}>
					<h1>Founders</h1>
					<p>
						We're a highly experienced and innovative team with an obsession for making the Web3 experience as sleek,
						intuitive and enjoyable as possible
					</p>
				</div>
				<div className={Style.main_founders_images}>
					<div className={Style.main_founders_images_wrapper}>
						<Image src={images.founder1} alt='Team member image' className={Style.main_founders_images_wrapper_image} />
						<p>Lara Steel</p>
						<p>Chief Executive Officer</p>
					</div>
					<div className={Style.main_founders_images_wrapper}>
						<Image src={images.founder2} alt='Team member image' className={Style.main_founders_images_wrapper_image} />
						<p>David Ben</p>
						<p>Chief Technology Officer</p>
					</div>
					<div className={Style.main_founders_images_wrapper}>
						<Image src={images.founder3} alt='Team member image' className={Style.main_founders_images_wrapper_image} />
						<p>Mohammed Radwan</p>
						<p>Lead Developer</p>
					</div>
					<div className={Style.main_founders_images_wrapper}>
						<Image src={images.founder4} alt='Team member image' className={Style.main_founders_images_wrapper_image} />
						<p>Sarah Connor</p>
						<p>Chief Marketing Officer</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default About;
