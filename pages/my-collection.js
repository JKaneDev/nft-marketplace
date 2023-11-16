import React from 'react';

// INTERNAL IMPORTS
import { MyNFTs } from '@/app/components/componentindex';
import Style from '../styles/my-collection.module.scss';
import '../app/globals.scss';
import Layout from '@/app/layout';

const MyCollection = () => {
	return (
		<>
			<Layout>
				<MyNFTs />
			</Layout>
		</>
	);
};

export default MyCollection;
