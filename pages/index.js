import React from 'react';
import { Hero, Connect, CurrentAuction } from '../app/components/componentindex';
import Layout from '../app/layout';

export const HomePage = () => {
	return (
		<div>
			<Layout>
				<Hero />
				<Connect />
				<CurrentAuction />
			</Layout>
		</div>
	);
};

export default HomePage;
