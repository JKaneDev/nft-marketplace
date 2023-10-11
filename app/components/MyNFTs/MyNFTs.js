'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './MyNFTs.module.scss';
import { AuctionCard } from '../componentindex';
import images from '../../../assets/index';

// EXTERNAL IMPORTS
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaShare, FaCaretDown, FaSearch } from 'react-icons/fa';

const MyNFTs = () => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleDropdownToggle = () => {
		setIsOpen(!isOpen);
	};

	const categories = ['Digital Art', 'Gaming', 'Sport', 'Photography', 'Music'];

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
			<div className={Style.main_profile_search} ref={dropdownRef}>
				<div className={Style.main_profile_search_input}>
					<FaSearch className={Style.main_profile_search_input_icon} />
					<input type='text' />
				</div>
				<button onClick={handleDropdownToggle} className={Style.main_profile_search_btn}>
					<p>Select Category</p>
					<FaCaretDown className={isOpen ? Style.rotate_up : Style.rotate_down} />
				</button>
				{isOpen && (
					<div className={Style.dropdown_content}>
						{categories.map((category, index) => (
							<button
								key={index}
								onClick={() => console.log(`${category} selected`)}
								className={Style.main_profile_search_btns}
							>
								{category}
							</button>
						))}
					</div>
				)}
			</div>
			<div className={Style.main_profile_view}>
				<AuctionCard />
			</div>
		</div>
	);
};

export default MyNFTs;
