import React, { useEffect } from 'react';
import Style from '../styles/homepage.module.scss';
import { Hero, Connect, CurrentAuction } from '../app/components/componentindex';
import Layout from '../app/layout';
import {
	loadAuctionFactoryContract,
	loadMarketplaceContract,
} from '@/store/blockchainInteractions';
import { useDispatch } from 'react-redux';

export const HomePage = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		const loadBlockchainData = async (dispatch) => {
			await loadMarketplaceContract(dispatch);
			await loadAuctionFactoryContract(dispatch);
		};

		loadBlockchainData(dispatch);
	}, []);

	return (
		<>
			<Layout>
				<div className={Style.homeview}>
					<Hero />
					<Connect />
				</div>
				<CurrentAuction />
			</Layout>
		</>
	);
};

export default HomePage;
