'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import { MdRestartAlt } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

// BLOCKCHAIN + BACKEND IMPORTS
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

// INTERNAL IMPORTS
import Style from './Watchlist.module.scss';
import { AuctionCard, StaticSaleCard } from '../componentindex';
import { RingLoader } from 'react-spinners';

const Watchlist = () => {
	const dispatch = useDispatch();
	const dropdownRef = useRef(null);

	const [loading, setLoading] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const [selectedTab, setSelectedTab] = useState('My Watchlist');
	const [category, setCategory] = useState(null);
	const [activeAuctions, setActiveAuctions] = useState([]);
	const [watchlist, setWatchlist] = useState([]);

	const user = useSelector((state) => state.connection.account);
	const auctions = useSelector((state) => state.auctionFactory.auctions);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setFilterOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		getWatchlist();
	}, []);

	useEffect(() => {
		const auctionIds = auctions.map((auction) => auction.nftId);
		setActiveAuctions(auctionIds);
	}, []);

	const getWatchlist = async () => {
		try {
			if (user) {
				setLoading(true);
				const ref = doc(db, 'users', user.account);
				const document = await getDoc(ref);
				if (document.exists()) {
					const data = document.data();
					const watchlist = Object.values(data.watchlist);
					setWatchlist(watchlist);
				}
				setLoading(false);
			}
		} catch (error) {
			console.error('Error setting watchlist to state: ', error);
		}
	};

	const handleFilterDropdownToggle = () => {
		setFilterOpen(!filterOpen);
	};

	const handleCategorySelect = (category) => {
		setCategory(category);
	};

	const handleResetFilter = () => {
		setCategory(null);
	};

	const handleTabToggle = (tabName) => {
		setSelectedTab(tabName);
	};

	const categories = ['Digital Art', 'Gaming', 'Sport', 'Photography', 'Music'];

	const filteredWatchlist = useMemo(() => {
		let categorizedWatchlist;

		if (category) {
			categorizedWatchlist = watchlist.filter((nft) => nft.category === category);
			return categorizedWatchlist;
		}
	}, [category]);

	return (
		<div className={Style.main}>
			<h1>Watchlist</h1>
			<div className={Style.main_select} ref={dropdownRef}>
				<button
					className={`${Style.main_select_options} ${
						selectedTab === 'My Watchlist' ? 'selected' : ''
					}`}
					onClick={() => handleTabToggle('My Watchlist')}
				>
					My Watchlist
				</button>
				<button
					className={`${Style.main_select_options} ${
						selectedTab === 'Most Popular' ? 'selected' : ''
					}`}
					onClick={() => handleTabToggle('Most Popular')}
				>
					Most Popular
				</button>
				<button className={Style.main_select_filter} onClick={handleFilterDropdownToggle}>
					<span>Filter</span>
					<FaCaretDown className={filterOpen ? Style.rotate_up : Style.rotate_down} />
				</button>
				{filterOpen && (
					<div className={Style.main_select_dropdown}>
						{categories.map((category, index) => (
							<button
								key={index}
								className={Style.main_select_dropdown_options}
								onClick={() => handleCategorySelect(category)}
							>
								{category}
							</button>
						))}
					</div>
				)}
			</div>
			<>
				{loading ? (
					<>
						<RingLoader size={50} color='#fff' />
					</>
				) : (
					<div className={Style.main_watchlist}>
						<MdRestartAlt
							size={28}
							className={Style.main_profile_view_reset}
							onClick={handleResetFilter}
						/>
						{filteredWatchlist
							? filteredWatchlist.map((nft) => {
									const isAtAuction = activeAuctions.includes(nft.id);
									return isAtAuction ? (
										<AuctionCard key={nft.id} {...nft} />
									) : (
										<StaticSaleCard key={nft.id} {...nft} resetUserData={getWatchlist} />
									);
							  })
							: watchlist.map((nft) => {
									const isAtAuction = activeAuctions.includes(nft.id);
									return isAtAuction ? (
										<AuctionCard key={nft.id} {...nft} />
									) : (
										<StaticSaleCard key={nft.id} {...nft} resetUserData={getWatchlist} />
									);
							  })}
					</div>
				)}
			</>
		</div>
	);
};

export default Watchlist;
