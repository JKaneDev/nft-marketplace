import React from 'react';
import nft from '../assets/punk-1.png';
import Image from 'next/image';

export const Home = () => {
	return (
		<>
			<div>Home</div>
			<Image src={nft}></Image>
		</>
	);
};

export default Home;
