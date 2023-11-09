import React from 'react';
import { Navbar, Hero, Connect, CurrentAuction, Footer } from './components/componentindex';

export const Page = () => {
	return (
		<main>
			<Navbar />
			<Hero />
			<Connect />
			<CurrentAuction />
			<Footer />
		</main>
	);
};

export default Page;
