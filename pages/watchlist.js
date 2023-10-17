import React from 'react';

// INTERNAL IMPORTS
import '../app/globals.scss';
import { Navbar, Watchlist, Footer } from '@/app/components/componentindex';

const WatchlistPage = () => {
	return (
		<div>
			<Navbar />
			<Watchlist />
			<Footer />
		</div>
	);
};

export default WatchlistPage;
