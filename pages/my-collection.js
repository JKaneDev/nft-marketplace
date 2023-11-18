import React from 'react';

// INTERNAL IMPORTS
import { MyNFTs } from '@/app/components/componentindex';
import './globals.scss';
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
