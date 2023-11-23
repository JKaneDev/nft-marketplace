'use client';

import React, { useState } from 'react';
import Style from './Footer.module.scss';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Footer = () => {
	const [email, setEmail] = useState('');

	const FaFacebookF = dynamic(() => import('react-icons/fa').then((mod) => mod.FaFacebookF), {
		ssr: false,
	});

	const FaInstagram = dynamic(() => import('react-icons/fa').then((mod) => mod.FaInstagram), {
		ssr: false,
	});

	const FaLinkedinIn = dynamic(() => import('react-icons/fa').then((mod) => mod.FaLinkedinIn), {
		ssr: false,
	});

	const FaTwitter = dynamic(() => import('react-icons/fa').then((mod) => mod.FaTwitter), {
		ssr: false,
	});

	const MdSend = dynamic(() => import('react-icons/md').then((mod) => mod.MdSend), {
		ssr: false,
	});

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
					<Link href={{ pathname: 'search-marketplace' }}>Search Marketplace</Link>
					<Link href={{ pathname: 'my-collection' }}>My Collection</Link>
					<Link href={{ pathname: 'watchlist' }}>Watchlist</Link>
					<Link href={{ pathname: 'author-profile' }}>Edit Profile</Link>
					<Link href='/'>Blog</Link>
				</div>
			</div>
			<div className={Style.main_columns}>
				<p>Help Centre</p>
				<div className={Style.main_columns_help}>
					<Link href={{ pathname: 'about' }}>About</Link>
					<Link href={{ pathname: 'contact-us' }}>Contact Us</Link>
					<Link href={{ pathname: '/' }}>Settings</Link>
				</div>
			</div>
			<div className={Style.main_columns}>
				<p>Subscribe</p>
				<div className={Style.main_columns_newsletter}>
					<MdSend className={Style.main_columns_newsletter_icon} />
					<input
						type='text'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className={Style.main_columns_newsletter_input}
						placeholder='Enter your email...'
					/>
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
