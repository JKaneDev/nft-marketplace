import React from 'react';

// INTERNAL IMPORTS
import '../app/globals.scss';
import { Navbar, CreateNFT } from '@/app/components/componentindex';

const CreatePage = () => {
	return (
		<div>
			<Navbar />
			<CreateNFT />
		</div>
	);
};

export default CreatePage;
