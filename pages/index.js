import React from 'react';
import Style from '../styles/homepage.module.scss';
import { Hero, Connect, CurrentAuction } from '../app/components/componentindex';
import Layout from '../app/layout';

export const HomePage = () => {
	return (
		<div>
			<Layout>
				<div className={Style.homeview}>
					<Hero />
					<Connect />
				</div>
				<CurrentAuction />
			</Layout>
		</div>
	);
};

export default HomePage;
