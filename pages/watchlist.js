import React from 'react';

// INTERNAL IMPORTS
import './globals.scss';
import { Watchlist } from '@/app/components/componentindex';
import Layout from '@/app/layout';

const WatchlistPage = () => {
	return (
		<>
			<Layout>
				<Watchlist />
			</Layout>
		</>
	);
};

export default WatchlistPage;
