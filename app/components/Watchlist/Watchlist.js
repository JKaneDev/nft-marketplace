'use client';

import React, { useEffect, useState, useRef } from 'react';

// INTERNAL IMPORTS
import Style from './Watchlist.module.scss';
import { AuctionCard } from '../componentindex';
import { FaCaretDown } from 'react-icons/fa';

const Watchlist = () => {
	const dropdownRef = useRef(null);

	const [filterOpen, setFilterOpen] = useState(false);

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

	const handleFilterDropdownToggle = () => {
		setFilterOpen(!filterOpen);
	};

	const categories = ['Digital Art', 'Gaming', 'Sport', 'Photography', 'Music'];

	return (
		<div className={Style.main}>
			<h1>Watchlist</h1>
			<div className={Style.main_select} ref={dropdownRef}>
				<button className={Style.main_select_options}>Most Popular</button>
				<button className={Style.main_select_options}>My Watchlist</button>
				<button className={Style.main_select_filter} onClick={handleFilterDropdownToggle}>
					<span>Filter</span>
					<FaCaretDown className={filterOpen ? Style.rotate_up : Style.rotate_down} />
				</button>
				{filterOpen && (
					<div className={Style.main_select_dropdown}>
						{categories.map((category, index) => (
							<button key={index} className={Style.main_select_dropdown_options}>
								{category}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Watchlist;
