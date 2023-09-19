import React from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import '../app/globals.scss';
import Style from '../styles/collection.module.scss';
import { Navbar } from '@/app/components/componentindex';

const Collection = () => {
	return (
		<div className={Style.collection}>
			<Navbar />
			<div className={Style.collection_image}></div>
		</div>
	);
};

export default Collection;
