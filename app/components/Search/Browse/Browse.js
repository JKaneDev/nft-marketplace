'use client';

import React, { useState, useEffect } from 'react';

// INTERNAL IMPORTS
import Style from './Browse.module.scss';
import images from '../../../../assets/index';
import { AuctionCard } from '../../componentindex';

import { FaSearch } from 'react-icons/fa';

const Browse = () => {
	const [selectedCategory, setSelectedCategory] = useState('');

	const handleCategorySelect = (e) => {
		setSelectedCategory(e.target.innerText);
	};

	useEffect(() => {}, [selectedCategory]);

	return (
		<div className={Style.browse}>
			<div className={Style.browse_search}>
				<FaSearch className={Style.browse_search_icon} />
				<input type='text' className={Style.browse_search_input} placeholder='Search NFTs' />
			</div>
			<div className={Style.browse_wrapper}>
				<button className={Style.browse_wrapper_genre} onClick={handleCategorySelect}>
					Digital Art
				</button>
				<button className={Style.browse_wrapper_genre} onClick={handleCategorySelect}>
					Gaming
				</button>
				<button className={Style.browse_wrapper_genre} onClick={handleCategorySelect}>
					Sport
				</button>
				<button className={Style.browse_wrapper_genre} onClick={handleCategorySelect}>
					Photography
				</button>
				<button className={Style.browse_wrapper_genre} onClick={handleCategorySelect}>
					Music
				</button>
			</div>
			<div className={Style.browse_auctions}>
				<AuctionCard />
			</div>
		</div>
	);
};

export default Browse;
