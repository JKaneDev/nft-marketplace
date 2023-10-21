import React from 'react';

// INTERNAL IMPORTS
import '../app/globals.scss';
import { Navbar, CreateNFT, Footer } from '@/app/components/componentindex';

const CreatePage = () => {
	return (
		<div>
			<Navbar />
			<CreateNFT />
			<Footer />
		</div>
	);
};

export default CreatePage;
