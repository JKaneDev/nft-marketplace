import React from 'react';

// INTERNAL IMPORTS
import Style from './Browse.module.scss';
import images from '../../../../assets/index';
import { AuctionCard } from '../../componentindex';

import { FaSearch } from 'react-icons/fa';

const Browse = () => {
	return (
		<div className={Style.browse}>
			<div className={Style.browse_search}>
				<FaSearch className={Style.browse_search_icon} />
				<input type='text' className={Style.browse_search_input} placeholder='Search NFTs' />
			</div>
			<div className={Style.browse_wrapper}>
				<button className={Style.browse_wrapper_genre}>Digital Art</button>
				<button className={Style.browse_wrapper_genre}>Gaming</button>
				<button className={Style.browse_wrapper_genre}>Sport</button>
				<button className={Style.browse_wrapper_genre}>Photography</button>
				<button className={Style.browse_wrapper_genre}>Music</button>
			</div>
			<div className={Style.browse_auctions}>
				<AuctionCard />
			</div>
		</div>
	);
};

export default Browse;
