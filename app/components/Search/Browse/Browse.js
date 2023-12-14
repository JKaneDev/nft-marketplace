'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Fuse from 'fuse.js';

// BLOCKCHAIN + BACKEND IMPORTS
import { db, realtimeDb } from '@/firebaseConfig';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { get, ref, set, remove } from 'firebase/database';

// INTERNAL IMPORTS
import Style from './Browse.module.scss';
import {
	createContractInstance,
	listenForCreatedAuctions,
	loadActiveAuctions,
} from '@/store/blockchainInteractions';

// EXTERNAL IMPORTS
import { FaSearch, FaCaretDown } from 'react-icons/fa';
import { MdRestartAlt } from 'react-icons/md';
import { RiFilterLine } from 'react-icons/ri';
import { AuctionCard, StaticSaleCard } from '../../componentindex';

const Browse = () => {
	const dispatch = useDispatch();
	const dropdownRef = useRef(null);

	const [currentFilter, setCurrentFilter] = useState('Marketplace');
	const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
	const [currentCategory, setCurrentCategory] = useState(null);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [userData, setUserData] = useState(null);
	const [allNFTs, setAllNFTs] = useState([]);

	const auctionFactoryDetails = useSelector((state) => state.auctionFactory.contractDetails);
	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const user = useSelector((state) => state.connection.account);

	// Fetch data for all users depending on filter selection
	useEffect(() => {
		const fetchUsersNFTs = async () => {
			const querySnapshot = await getDocs(collection(db, 'users'));
			const fetchedNFTs = [];

			querySnapshot.forEach((doc) => {
				if (doc.id !== user) {
					const userData = doc.data();
					Object.values(userData.ownedNFTs).forEach((nft) => {
						if (nft.isListed == true) {
							fetchedNFTs.push(nft);
						}
					});
				}
			});

			setAllNFTs(fetchedNFTs);
		};

		fetchUsersNFTs();
	}, [user, currentFilter]);

	// FETCH USER DATA VIA FIRESTORE USING WALLET ADDRESS (ON PAGE LOAD)
	useEffect(() => {
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

	// Load and listen for auctions
	useEffect(() => {
		const loadAuctionFactoryFunctions = async () => {
			const auctionFactoryContract = await createContractInstance(auctionFactoryDetails);
			await listenForCreatedAuctions(dispatch, auctionFactoryContract);
			await loadActiveAuctions(dispatch);
		};

		loadAuctionFactoryFunctions();
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

	const filterOptions = ['Marketplace', 'Live Auctions'];

	const handleCategorySelect = (category) => {
		setCurrentCategory(category);
	};

	const handleFilterSelect = (filter) => {
		setCurrentFilter(filter);
	};

	const handleResetFilter = () => {
		setCurrentCategory(null);
		setCurrentFilter('Marketplace');
		setSearchQuery('');
	};

	const handleSearchQuery = (e) => {
		setSearchQuery(e.target.value);
	};

	const checkStaticSaleOrAuction = (nfts, auctions) => {
		try {
			const activeAuctionIds = auctions.map((auction) => auction.nftId);

			const auctionItems = nfts.filter((nft) => activeAuctionIds.includes(nft.id));
			const marketplaceItems = nfts.filter((nft) => !activeAuctionIds.includes(nft.id));

			return { auctionItems, marketplaceItems };
		} catch (error) {
			console.error('Error checking items for sale or auction');
			return nfts;
		}
	};

	const filteredNFTs = useMemo(() => {
		let nfts = allNFTs;

		let itemsToRender = checkStaticSaleOrAuction(nfts, auctions);

		switch (currentFilter) {
			case 'Marketplace':
				nfts = itemsToRender.marketplaceItems;
				break;
			case 'Live Auctions':
				nfts = itemsToRender.auctionItems;
				break;
			default:
				nfts = itemsToRender.marketplaceItems;
				break;
		}

		if (currentCategory) {
			nfts = nfts.filter((nft) => nft.category === currentCategory);
		}

		// Set up fuzzy search
		const fuse = new Fuse(nfts, {
			keys: ['name', 'properties'],
			includeScore: true,
			threshold: 0.3,
		});

		const searchResults = searchQuery ? fuse.search(searchQuery) : nfts;
		return searchQuery ? searchResults.map((result) => result.item) : nfts;
	}, [allNFTs, currentFilter, currentCategory, searchQuery]);

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
							isCategoriesOpen
								? Style.browse_wrapper_category_rotateup
								: Style.browse_wrapper_category_rotatedown
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
				<MdRestartAlt
					size={28}
					className={Style.browse_auctions_reset}
					onClick={handleResetFilter}
				/>
				<>
					{filteredNFTs && currentFilter === 'Live Auctions' ? (
						filteredNFTs.map((nft) => (
							<AuctionCard
								key={nft.id}
								id={nft.id}
								image={nft.image}
								name={nft.name}
								category={nft.category}
								price={nft.price}
								isListed={nft.isListed}
							/>
						))
					) : filteredNFTs && currentFilter === 'Marketplace' ? (
						filteredNFTs.map((nft) => (
							<StaticSaleCard
								key={nft.id}
								id={nft.id}
								name={nft.name}
								image={nft.image}
								category={nft.category}
								price={nft.price}
								isListed={nft.isListed}
							/>
						))
					) : (
						<></>
					)}
				</>
			</div>
		</div>
	);
};

export default Browse;
