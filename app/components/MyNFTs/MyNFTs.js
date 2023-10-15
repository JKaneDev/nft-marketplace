'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './MyNFTs.module.scss';
import { AuctionCard } from '../componentindex';
import images from '../../../assets/index';

// EXTERNAL IMPORTS
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaShare, FaCaretDown, FaSearch } from 'react-icons/fa';
import { RiFilterLine } from 'react-icons/ri';

const MyNFTs = () => {
	const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsCategoriesOpen(false);
				setIsFilterOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleCategoriesDropdownToggle = () => {
		setIsCategoriesOpen(!isCategoriesOpen);
		setIsFilterOpen(false);
	};

	const handleFilterDropdownToggle = () => {
		setIsFilterOpen(!isFilterOpen);
		setIsCategoriesOpen(false);
	};

	const categories = ['Digital Art', 'Gaming', 'Sport', 'Photography', 'Music'];

	const filterOptions = ['Currently Owned', 'Previously Owned', 'Watchlist'];

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
						<FaShare className={Style.main_profile_info_actions_icons} />
					</div>
				</div>
			</div>
			<div className={Style.main_profile_search} ref={dropdownRef}>
				<div className={Style.main_profile_search_input}>
					<FaSearch className={Style.main_profile_search_input_icon} />
					<input type='text' />
				</div>
				<button onClick={handleCategoriesDropdownToggle} className={Style.main_profile_search_btn}>
					<p>Select Category</p>
					<FaCaretDown className={isCategoriesOpen ? Style.rotate_up : Style.rotate_down} />
				</button>
				{isCategoriesOpen && (
					<div className={Style.dropdown_content_category}>
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
				<button onClick={handleFilterDropdownToggle} className={Style.main_profile_search_btn}>
					<RiFilterLine size={20.5} />
				</button>
				{isFilterOpen && (
					<div className={Style.dropdown_content_filter}>
						{filterOptions.map((option, index) => (
							<button
								key={index}
								onClick={() => console.log(`${option} selected`)}
								className={Style.main_profile_search_btns}
							>
								{option}
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
