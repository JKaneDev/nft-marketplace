'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Image from 'next/image';

// BLOCKCHAIN + BACKEND IMPORTS
import { db, realtimeDb } from '../../../firebaseConfig';
import { get, ref } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';

// INTERNAL IMPORTS
import Style from './MyNFTs.module.scss';
import { MarketItem, AuctionCard, StaticSaleCard } from '../componentindex';
import images from '../../../assets/index';
import {
	loadActiveAuctions,
	listenForCreatedAuctions,
	createContractInstance,
} from '@/store/blockchainInteractions';

// EXTERNAL IMPORTS
import {
	FaFacebookF,
	FaInstagram,
	FaLinkedinIn,
	FaTwitter,
	FaShare,
	FaCaretDown,
	FaSearch,
} from 'react-icons/fa';
import { MdRestartAlt } from 'react-icons/md';
import { RiFilterLine } from 'react-icons/ri';
import Fuse from 'fuse.js';
import { useSelector } from 'react-redux';

const MyNFTs = () => {
	const dispatch = useDispatch();

	const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [currentCategory, setCurrentCategory] = useState(null);
	const [currentFilter, setCurrentFilter] = useState('Currently Listed');
	const [searchQuery, setSearchQuery] = useState('');
	const [userData, setUserData] = useState(null);
	const [activeAuctions, setActiveAuctions] = useState([]);
	const [endedAuctions, setEndedAuctions] = useState([]);
	const dropdownRef = useRef(null);

	const user = useSelector((state) => state.connection.account);
	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const auctionFactoryDetails = useSelector((state) => state.auctionFactory.contractDetails);

	// FETCH USER DATA VIA FIRESTORE USING WALLET ADDRESS (ON PAGE LOAD)
	useEffect(() => {
		fetchUserData();
	}, [user]);

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

	/**
	 * Loads the auction factory functions by creating a contract instance, listening for created auctions,
	 * and loading active auctions.
	 */
	useEffect(() => {
		let cleanupFunc;

		const loadAuctionFactoryFunctions = async () => {
			const auctionFactoryContract = await createContractInstance(auctionFactoryDetails);
			cleanupFunc = await listenForCreatedAuctions(dispatch, auctionFactoryContract);
			await loadActiveAuctions(dispatch);
		};

		loadAuctionFactoryFunctions();

		return () => {
			if (cleanupFunc) cleanupFunc();
		};
	}, [dispatch, auctionFactoryDetails]);

	useEffect(() => {
		const auctionIds = auctions.map((auction) => auction.nftId);
		setActiveAuctions(auctionIds);
	}, [auctions]);

	/**
	 * Fetches user data from the database and updates the state with the retrieved data.
	 * @returns {Promise<void>} A promise that resolves when the user data has been fetched and updated.
	 */
	const fetchUserData = async () => {
		try {
			if (user) {
				const userRef = doc(db, 'users', user.account);
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

	const handleCategoriesDropdownToggle = () => {
		setIsCategoriesOpen(!isCategoriesOpen);
		setIsFilterOpen(false);
	};

	const handleFilterDropdownToggle = () => {
		setIsFilterOpen(!isFilterOpen);
		setIsCategoriesOpen(false);
	};

	const categories = ['Digital Art', 'Gaming', 'Sport', 'Photography', 'Music'];

	const filterOptions = ['Currently Owned', 'Currently Listed', 'Watchlist'];

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

	const checkEndedAuctions = async () => {
		const auctionsRef = ref(realtimeDb, 'endedAuctions');
		const snapshot = await get(auctionsRef);
		if (snapshot.exists()) {
			const data = snapshot.val();
			const auctions = Object.values(data);
			auctions.length > 0 ? setEndedAuctions(auctions) : setEndedAuctions([]);
		} else {
			setEndedAuctions([]);
		}
	};

	/**
	 * Returns a filtered list of NFTs based on the provided user data, filter options, and search query.
	 * @param {Object} userData - The user data containing owned NFTs and watchlist.
	 * @param {string} currentCategory - The current category filter.
	 * @param {string} currentFilter - The current filter option.
	 * @param {string} searchQuery - The search query for fuzzy search.
	 * @returns {Array} - The filtered list of NFTs.
	 */
	const filteredNFTs = useMemo(() => {
		if (!userData || !userData.ownedNFTs) return [];

		let nfts = Object.values(userData.ownedNFTs);
		let watchlist = Object.values(userData.watchlist);

		switch (currentFilter) {
			case 'Currently Owned':
				nfts = nfts.filter((nft) => !nft.isListed);
				break;
			case 'Watchlist':
				nfts = watchlist;
			case 'Currently Listed':
				nfts = nfts.filter((nft) => nft.isListed);
				break;
			default:
				break;
		}

		if (currentCategory) {
			nfts = nfts.filter((nft) => nft.category === currentCategory);
		}

		// Set up fuzzy search
		const fuse = new Fuse(nfts, {
			keys: ['name', 'properties', 'description'],
			includeScore: true,
			threshold: 0.3,
		});

		// Perform fuzzy search
		const searchResults = searchQuery ? fuse.search(searchQuery) : nfts;

		return searchQuery ? searchResults.map((result) => result.item) : nfts;
	}, [userData, currentCategory, currentFilter, searchQuery]);

	return (
		<div className={Style.main}>
			<div className={Style.main_profile}>
				{userData ? (
					<Image
						src={userData.profilePicture}
						alt='user profile picture'
						className={Style.main_profile_image}
						width={120}
						height={120}
					/>
				) : (
					<Image
						src={images.placeholder}
						alt="user's profile pic"
						className={Style.main_profile_image}
					/>
				)}
				<div className={Style.main_profile_info}>
					<h1>{userData && userData.name ? userData.name : 'Username'}</h1>
					<p>
						{userData && userData.description
							? userData.description
							: 'Description of marketplace user goes here'}
					</p>
					<div className={Style.main_profile_info_socials}>
						<div
							className={Style.main_profile_info_socials_wrapper}
							onClick={() => {
								if (userData && userData.facebookHandle) {
									window.open(userData.facebookHandle, '_blank');
								}
							}}
						>
							<FaFacebookF size={18} className={Style.main_profile_info_socials_wrapper_icons} />
						</div>
						<div
							className={Style.main_profile_info_socials_wrapper}
							onClick={() => {
								if (userData && userData.instagramHandle) {
									window.open(userData.instagramHandle, '_blank');
								}
							}}
						>
							<FaInstagram size={18} className={Style.main_profile_info_socials_wrapper_icons} />
						</div>
						<div
							className={Style.main_profile_info_socials_wrapper}
							onClick={() => {
								if (userData && userData.linkedInHandle) {
									window.open(userData.linkedInHandle, '_blank');
								}
							}}
						>
							<FaLinkedinIn size={18} className={Style.main_profile_info_socials_wrapper_icons} />
						</div>
						<div
							className={Style.main_profile_info_socials_wrapper}
							onClick={() => {
								if (userData && userData.twitterHandle) {
									window.open(userData.twitterHandle, '_blank');
								}
							}}
						>
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
					<input type='text' onChange={handleSearchQuery} value={searchQuery} />
				</div>
				<button onClick={handleCategoriesDropdownToggle} className={Style.main_profile_search_btn}>
					<p>{currentCategory ? currentCategory : 'Select Category'}</p>
					<FaCaretDown className={isCategoriesOpen ? Style.rotate_up : Style.rotate_down} />
				</button>
				{isCategoriesOpen && (
					<div className={Style.dropdown_content_category}>
						{categories.map((category, index) => (
							<button
								key={index}
								onClick={() => {
									handleCategorySelect(category);
								}}
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
								onClick={() => {
									handleFilterSelect(option);
								}}
								className={Style.main_profile_search_btns}
							>
								{option}
							</button>
						))}
					</div>
				)}
			</div>
			<div className={Style.main_profile_view}>
				<MdRestartAlt
					size={28}
					className={Style.main_profile_view_reset}
					onClick={handleResetFilter}
				/>
				<>
					{filteredNFTs &&
						filteredNFTs.map((nft) => {
							if (currentFilter === 'Currently Owned' || currentFilter === 'Currently Listed') {
								return (
									<MarketItem
										key={nft.id}
										resetUserData={fetchUserData}
										checkEndedAuctions={checkEndedAuctions}
										{...nft}
									/>
								);
							} else if (currentFilter === 'Watchlist') {
								const isAtAuction = activeAuctions.includes(nft.id);
								return isAtAuction ? (
									<AuctionCard key={nft.id} {...nft} />
								) : (
									<StaticSaleCard key={nft.id} {...nft} />
								);
							}
						})}
				</>
			</div>
		</div>
	);
};

export default MyNFTs;
