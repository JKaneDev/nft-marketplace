import React from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import '../app/globals.scss';
import Style from '../styles/search-marketplace.module.scss';
import { Featured, Browse } from '@/app/components/componentindex';
import Layout from '@/app/layout';

const SearchMarketplace = () => {
	return (
		<>
			<Layout>
				<Featured />
				<Browse />
			</Layout>
		</>
	);
};

export default SearchMarketplace;
