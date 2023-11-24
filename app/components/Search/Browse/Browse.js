'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';

// BLOCKCHAIN + BACKEND IMPORTS
import { ethers } from 'ethers';
import { db } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// INTERNAL IMPORTS
import Style from './Browse.module.scss';
import { AuctionCard } from '../../componentindex';
import images from '../../../../assets/index';

// EXTERNAL IMPORTS
import { FaSearch, FaCaretDown } from 'react-icons/fa';
import { MdRestartAlt } from 'react-icons/md';
import { RiFilterLine } from 'react-icons/ri';
import Fuse from 'fuse.js';

const Browse = () => {
	const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [currentCategory, setCurrentCategory] = useState(null);
	const [currentFilter, setCurrentFilter] = useState('Currently Owned'); // or 'watchlist
	const [searchQuery, setSearchQuery] = useState('');
	const [userData, setUserData] = useState(null);
	const dropdownRef = useRef(null);

	// FETCH USER DATA VIA FIRESTORE USING WALLET ADDRESS (ON PAGE LOAD)
	useEffect(() => {
		const getWalletAddress = async () => {
			if (window.ethereum) {
				const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
				// const provider = new ethers.provider.Web3Provider(window.ethereum);
				const signer = await provider.getSigner();
				return await signer.getAddress();
			}
			return null;
		};

		const fetchUserData = async () => {
			try {
				const walletAddress = await getWalletAddress();

				if (walletAddress) {
					const userRef = doc(db, 'users', walletAddress);
					const docSnap = await getDoc(userRef);
					if (docSnap.exists()) {
						const data = docSnap.data();
						setUserData({
							name: data.displayName,
							description: data.description,
							walletAddress: data.walletAddress,
							website: data.website,
							facebook: data.facebookHandle,
							twitter: data.twitterHandle,
							instagram: data.instagramHandle,
							linkedIn: data.linkedInHandle,
							profilePicture: data.profilePicture,
							ownedNFTs: data.ownedNFTs,
							watchlist: data.watchlist,
						});
					} else {
						console.log("Document doesn't exist in database");
					}
				}
			} catch (error) {
				console.log('Error fetching user data: ', error);
			}
		};
		fetchUserData();
	}, []);

	// HANDLE CATEGORY AND FILTER MENU TOGGLES
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

	const filterOptions = ['Currently Owned', 'Watchlist'];

	const handleCategorySelect = (category) => {
		setCurrentCategory(category);
	};

	const handleFilterSelect = (filter) => {
		setCurrentFilter(filter);
	};

	const handleResetFilter = () => {
		setCurrentCategory(null);
		setCurrentFilter('Currently Owned');
		setSearchQuery('');
	};

	const handleSearchQuery = (e) => {
		setSearchQuery(e.target.value);
	};

	const filteredNFTs = useMemo(() => {
		if (!userData) return [];

		let nfts = currentFilter === 'Currently Owned' ? userData.ownedNFTs : userData.watchlist;
		if (currentCategory) {
			nfts = nfts.filter((nft) => nft.category === currentCategory);
		}

		// Set up fuzzy search
		const fuse = new Fuse(nfts, {
			keys: ['name', 'properties'],
			includeScore: true,
			threshold: 0.3,
		});

		// Perform fuzzy search
		const searchResults = searchQuery ? fuse.search(searchQuery) : nfts;
		return searchQuery ? searchResults.map((result) => result.item) : nfts;
	}, [userData, currentCategory, currentFilter, searchQuery]);

	return (
		<div className={Style.browse}>
			<div className={Style.browse_wrapper} ref={dropdownRef}>
				<div className={Style.browse_wrapper_search}>
					<FaSearch className={Style.browse_wrapper_search_icon} />
					<input
						type='text'
						className={Style.browse_wrapper_search_input}
						placeholder='Search NFTs'
						onChange={handleSearchQuery}
						value={searchQuery}
					/>
				</div>
				<button onClick={handleCategoriesDropdownToggle} className={Style.browse_wrapper_category}>
					<p>{currentCategory ? currentCategory : 'Select Category'}</p>
					<FaCaretDown
						className={
							isCategoriesOpen ? Style.browse_wrapper_category_rotateup : Style.browse_wrapper_category_rotatedown
						}
					/>
				</button>
				{isCategoriesOpen && (
					<div className={Style.browse_wrapper_category_menu}>
						{categories.map((category, index) => (
							<button
								key={index}
								onClick={() => {
									handleCategorySelect(category);
									console.log(`${category} selected`);
								}}
								className={Style.browse_wrapper_category_menu_options}
							>
								{category}
							</button>
						))}
					</div>
				)}
				<button onClick={handleFilterDropdownToggle} className={Style.browse_wrapper_filter}>
					<RiFilterLine size={20.5} className={Style.browse_wrapper_filter_icon} />
				</button>
				{isFilterOpen && (
					<div className={Style.browse_wrapper_filter_menu}>
						{filterOptions.map((option, index) => (
							<button
								key={index}
								onClick={() => {
									handleFilterSelect(option);
									console.log(`${option} selected`);
								}}
								className={Style.browse_wrapper_filter_menu_options}
							>
								{option}
							</button>
						))}
					</div>
				)}
			</div>
			<div className={Style.browse_auctions}>
				<MdRestartAlt size={28} className={Style.browse_auctions_reset} onClick={handleResetFilter} />
				<AuctionCard />
			</div>
		</div>
	);
};

export default Browse;
