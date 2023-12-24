'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Fuse from 'fuse.js';

// BLOCKCHAIN + BACKEND IMPORTS
import { db, realtimeDb } from '@/firebaseConfig';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';

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
import { AuctionCard, MarketItem, StaticSaleCard } from '../../componentindex';
import { get, ref } from 'firebase/database';
import { setAuctions } from '@/store/auctionFactorySlices';

const Browse = () => {
	const dispatch = useDispatch();
	const dropdownRef = useRef(null);

	const [currentFilter, setCurrentFilter] = useState('Marketplace');
	const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
	const [currentCategory, setCurrentCategory] = useState(null);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [userData, setUserData] = useState(null);
	const [listedNFTs, setListedNFTs] = useState([]);
	const [unlistedNFTs, setUnlistedNFTs] = useState([]);
	const [endedAuctions, setEndedAuctions] = useState([]);

	const auctionFactoryDetails = useSelector((state) => state.auctionFactory.contractDetails);
	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const user = useSelector((state) => state.connection.account);

	// Fetch data for all users depending on filter selection
	useEffect(() => {
		const fetchUsersNFTs = async () => {
			const querySnapshot = await getDocs(collection(db, 'users'));
			const listed = [];
			const unlisted = [];

			querySnapshot.forEach((doc) => {
				if (doc.id !== user) {
					const userData = doc.data();
					Object.values(userData.ownedNFTs).forEach((nft) => {
						if (nft.isListed === true) {
							listed.push(nft);
						} else {
							unlisted.push(nft);
						}
					});
				}

				setListedNFTs(listed);
				setUnlistedNFTs(unlisted);
			});
		};

		fetchUsersNFTs();
	}, [user, currentFilter, endedAuctions]);

	// FETCH USER DATA VIA FIRESTORE USING WALLET ADDRESS (ON PAGE LOAD)
	useEffect(() => {
		fetchUserData();
	}, []);

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
		let cleanupFunc;

		const loadAuctionFactoryFunctions = async () => {
			const auctionFactoryContract = await createContractInstance(auctionFactoryDetails);
			cleanupFunc = await listenForCreatedAuctions(dispatch, auctionFactoryContract);
			await loadActiveAuctions(dispatch);
		};

		loadAuctionFactoryFunctions();

		// Cleanup function is called when the component is unmounted
		return () => {
			if (cleanupFunc) cleanupFunc();
		};
	}, [dispatch, auctionFactoryDetails]);

	// Load endedAuctions
	useEffect(() => {
		if (unlistedNFTs.length > 0) checkEndedAuctions();
	}, [unlistedNFTs]);

	const handleCategoriesDropdownToggle = () => {
		setIsCategoriesOpen(!isCategoriesOpen);
		setIsFilterOpen(false);
	};

	const handleFilterDropdownToggle = () => {
		setIsFilterOpen(!isFilterOpen);
		setIsCategoriesOpen(false);
	};

	const categories = ['Digital Art', 'Gaming', 'Sport', 'Photography', 'Music'];

	const filterOptions = ['Marketplace', 'Live Auctions', 'Pending End'];

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

	const filteredNFTs = useMemo(() => {
		let nfts = listedNFTs;

		let renderListed = checkStaticSaleOrAuction(nfts, auctions);

		switch (currentFilter) {
			case 'Marketplace':
				nfts = renderListed.marketplaceItems;
				break;
			case 'Live Auctions':
				nfts = renderListed.auctionItems;
				break;
			case 'Pending End':
				nfts = unlistedNFTs.filter(
					(nft, index, self) =>
						// prevent duplicates
						self.findIndex((t) => t.id === nft.id) === index &&
						// check if nft is in endedAuctions
						endedAuctions.some((auction) => auction.nftId === nft.id),
				);
				break;
			default:
				nfts = renderListed.marketplaceItems;
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

		const searchResults = searchQuery ? fuse.search(searchQuery) : nfts;
		return searchQuery ? searchResults.map((result) => result.item) : nfts;
	}, [listedNFTs, unlistedNFTs, endedAuctions, currentFilter, currentCategory, searchQuery]);

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
								resetUserData={fetchUserData}
								checkEndedAuctions={checkEndedAuctions}
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
								resetUserData={fetchUserData}
							/>
						))
					) : filteredNFTs && currentFilter === 'Pending End' ? (
						filteredNFTs.map((nft) => (
							<MarketItem
								key={nft.id}
								resetUserData={fetchUserData}
								checkEndedAuctions={checkEndedAuctions}
								{...nft}
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
