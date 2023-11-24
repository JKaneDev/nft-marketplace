import React from 'react';

// INTERNAL IMPORTS
import Style from '../styles/search-marketplace.module.scss';
import { Featured, Browse } from '@/app/components/componentindex';
import Layout from '@/app/layout';

const SearchMarketplace = () => {
	return (
		<>
			<Layout>
				<div className={Style.wrapper}>
					<Featured />
					<Browse />
				</div>
			</Layout>
		</>
	);
};

export default SearchMarketplace;
