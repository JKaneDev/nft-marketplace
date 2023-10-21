import React from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import '../app/globals.scss';
import Style from '../styles/search-marketplace.module.scss';
import { Navbar, Featured, Browse, Footer } from '@/app/components/componentindex';

const SearchMarketplace = () => {
	return (
		<div className={Style.search}>
			<Navbar />
			<Featured />
			<Browse />
			<Footer />
		</div>
	);
};

export default SearchMarketplace;
