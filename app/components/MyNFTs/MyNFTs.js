import React from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './MyNFTs.module.scss';
import { AuctionCard } from '../componentindex';
import images from '../../../assets/index';

// EXTERNAL IMPORTS
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaShare } from 'react-icons/fa';

const MyNFTs = () => {
	return (
		<div className={Style.main}>
			<div className={Style.main_profile}>
				<Image src={images.placeholder} alt="user's profile pic" className={Style.main_profile_image} />
				<div className={Style.main_profile_info}>
					<h1>James Kane</h1>
					<p>
						An OG crypto enthusiast & NFT collector. Has his hands in many of the big collections. Including Pudgy
						Penguins, Bored Ape Yacht Club & Azuki
					</p>
					<div className={Style.main_profile_info_socials}>
						<div className={Style.main_profile_info_socials_wrapper}>
							<FaFacebookF size={18} className={Style.main_profile_info_socials_wrapper_icons} />
						</div>
						<div className={Style.main_profile_info_socials_wrapper}>
							<FaInstagram size={18} className={Style.main_profile_info_socials_wrapper_icons} />
						</div>
						<div className={Style.main_profile_info_socials_wrapper}>
							<FaLinkedinIn size={18} className={Style.main_profile_info_socials_wrapper_icons} />
						</div>
						<div className={Style.main_profile_info_socials_wrapper}>
							<FaTwitter size={18} className={Style.main_profile_info_socials_wrapper_icons} />
						</div>
					</div>

					<div className={Style.main_profile_info_actions}>
						<button>Follow</button>
						<FaShare className={Style.main_profile_info_actions_icons} />
					</div>
				</div>
			</div>
			<div className={Style.main_collection}>
				<AuctionCard />
			</div>
		</div>
	);
};

export default MyNFTs;
