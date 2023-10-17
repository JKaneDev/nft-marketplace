import React from 'react';
import Style from './Footer.module.scss';
import Link from 'next/link';

import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { MdSend } from 'react-icons/md';

const Footer = () => {
	return (
		<div className={Style.main}>
			<div className={Style.main_columns}>
				<p>
					Niftyverse is a futuristic NFT Marketplace where users can gain access to the latest trending NFTs before
					everyone else. Buy, sell and discover exclusive digital collectibles and enjoy your stay in the cryptoverse.
				</p>
				<div className={Style.main_columns_socials}>
					<div className={Style.main_columns_socials_wrapper}>
						<FaFacebookF className={Style.main_columns_socials_wrapper_icon} />
					</div>
					<div className={Style.main_columns_socials_wrapper}>
						<FaInstagram className={Style.main_columns_socials_wrapper_icon} />
					</div>
					<div className={Style.main_columns_socials_wrapper}>
						<FaLinkedinIn className={Style.main_columns_socials_wrapper_icon} />
					</div>
					<div className={Style.main_columns_socials_wrapper}>
						<FaTwitter className={Style.main_columns_socials_wrapper_icon} />
					</div>
				</div>
			</div>
			<div className={Style.main_columns}>
				<p>Discover</p>
				<div className={Style.main_columns_discover}>
					<Link href='./'>Connect Wallet</Link>
					<Link href='./'>Search Marketplace</Link>
					<Link href='./'>My Collection</Link>
					<Link href='./'>Watchlist</Link>
					<Link href='./'>Edit Profile</Link>
					<Link href='./'>Blog</Link>
				</div>
			</div>
			<div className={Style.main_columns}>
				<p>Help Centre</p>
				<div className={Style.main_columns_help}>
					<Link href='./'>About</Link>
					<Link href='./'>Contact Us</Link>
					<Link href='./'>Settings</Link>
				</div>
			</div>
			<div className={Style.main_columns}>
				<p>Subscribe</p>
				<div className={Style.main_columns_newsletter}>
					<MdSend className={Style.main_columns_newsletter_icon} />
					<input type='text' placeholder='Enter your email' />
					<p>
						Get the the most up-to-date information on upcoming NFT products, exclusive access to creator interviews and
						early-bird access to upcoming mints.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Footer;
