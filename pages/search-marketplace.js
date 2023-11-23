import React from 'react';

// INTERNAL IMPORTS
import './globals.scss';
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
