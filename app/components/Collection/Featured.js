import React from 'react';
import Image from 'next/image';

// REACT ICONS
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';

// INTERNAL IMPORTS
import Style from './Featured.module.scss';
import images from '../../../assets/index';

const Featured = () => {
	return (
		<div className={Style.featured}>
			<div className={Style.featured_wrapper}>
				<Image src={images.pudgy1} alt='featured nft image' className={Style.featured_wrapper_image} />
				<div className={Style.featured_wrapper_socials}>
					<div className={Style.featured_wrapper_socials_wrapper}>
						<FaFacebookF size={18} className={Style.featured_wrapper_socials_wrapper_icon} />
					</div>
					<div className={Style.featured_wrapper_socials_wrapper}>
						<FaInstagram size={18} className={Style.featured_wrapper_socials_wrapper_icon} />
					</div>
					<div className={Style.featured_wrapper_socials_wrapper}>
						<FaLinkedinIn size={18} className={Style.featured_wrapper_socials_wrapper_icon} />
					</div>
					<div className={Style.featured_wrapper_socials_wrapper}>
						<FaTwitter size={18} className={Style.featured_wrapper_socials_wrapper_icon} />
					</div>
				</div>
			</div>
			<div className={Style.featured_info}>
				<h1>Featured Collection</h1>
				<p>
					The Pudgy Penguins NFT collection is a vibrant and whimsical series of 8,888 hand-drawn, digital penguin
					collectibles living on the Ethereum blockchain. Embodying a mix of unique traits, these animated avians have
					quickly waddled their way into the hearts of NFT enthusiasts and the broader crypto community. Since their
					release, they've not only become symbols of status and camaraderie but have also fostered a strong, supportive
					community. Owners flaunt their Pudgy Penguins across social media, celebrating the rarity of specific traits.
				</p>
				<div className={Style.featured_info_floor}>
					<p>Floor Price:</p>
					<p>15 ETH</p>
					<p>+3.55%</p>
				</div>
			</div>
		</div>
	);
};

export default Featured;
