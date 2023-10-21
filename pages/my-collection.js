import React from 'react';

// INTERNAL IMPORTS
import { Navbar, MyNFTs, Footer } from '@/app/components/componentindex';
import '../app/globals.scss';
import Style from '../styles/my-collection.module.scss';

const MyCollection = () => {
	return (
		<div className={Style.collection}>
			<Navbar />
			<MyNFTs />
			<Footer />
		</div>
	);
};

export default MyCollection;
