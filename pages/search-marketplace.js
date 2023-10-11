import React from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import '../app/globals.scss';
import Style from '../styles/search-marketplace.module.scss';
import { Navbar, Featured, Browse } from '@/app/components/componentindex';

const SearchMarketplace = () => {
	return (
		<div className={Style.search}>
			<Navbar />
			<Featured />
			<Browse />
		</div>
	);
};

export default SearchMarketplace;
