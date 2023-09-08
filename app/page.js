import React from 'react';
import nft from '../assets/punk-1.png';
import Image from 'next/image';
import { Navbar, Hero, Connect } from './components/componentindex';

export const Page = () => {
	return (
		<main>
			<Navbar />
			<Hero />
			<Connect />
		</main>
	);
};

export default Page;
