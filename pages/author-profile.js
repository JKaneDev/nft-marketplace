import React from 'react';

// INTERNAL IMPORTS
import '../app/globals.scss';
import { Profile } from '@/app/components/componentindex';
import Layout from '@/app/layout';

const profile = () => {
	return (
		<>
			<Layout>
				<Profile />
			</Layout>
		</>
	);
};

export default profile;
