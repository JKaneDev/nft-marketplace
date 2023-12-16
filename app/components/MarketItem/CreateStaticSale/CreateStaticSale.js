// EXTERNAL IMPORTS
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { RingLoader } from 'react-spinners';
import { ethers } from 'ethers';

// BLOCKCHAIN + BACKEND IMPORTS
import { createContractInstance, resellMarketItem } from '@/store/blockchainInteractions';

// INTERNAL IMPORTS
import Style from './CreateStaticSale.module.scss';
import images from '../../../../assets/index';
import { useSelector } from 'react-redux';
import { toggleNFTListingStatus } from '@/pages/api/firebase';

const CreateStaticSale = ({ id, price, category, resetUserData }) => {
	const [loading, setLoading] = useState(false);
	const [newPrice, setNewPrice] = useState(null);
	const [settingPrice, setSettingPrice] = useState(false);

	const user = useSelector((state) => state.connection.account);
	const marketplaceDetails = useSelector((state) => state.marketplace.contractDetails);

	const handleResellMarketItem = async () => {
		try {
			setLoading(true);
			const marketplace = await createContractInstance(marketplaceDetails);
			const tx = await marketplace.resellMarketItem(id, ethers.parseEther(newPrice), user.account);
			const receipt = tx.wait();
			if (receipt) toggleNFTListingStatus(user.account, id);

			setTimeout(() => {
				setLoading(false);
				resetUserData();
			}, 1500);
		} catch (error) {
			console.error('Error relisting market item: ', error);
		}
	};

	const toggleSetPrice = () => {
		setSettingPrice(!settingPrice);
	};

	return (
		<div className={Style.wrapper}>
			<div className={Style.wrapper_price}>
				<p>Market Price:</p>
				<div className={Style.wrapper_price_input}>
					<input
						type='text'
						placeholder={`ETH Amount`}
						onChange={(e) => setNewPrice(e.target.value)}
					/>
					<Image src={images.eth} className={Style.wrapper_price_input_eth} alt='ETH symbol' />
				</div>
			</div>
			<div className={Style.wrapper_info}>
				<p>{`Last Sale: ${price}`}</p>
				{settingPrice && loading ? (
					<RingLoader size={30} color={'#fff'} />
				) : (
					<button onClick={handleResellMarketItem}>Relist NFT</button>
				)}
			</div>
		</div>
	);
};

export default CreateStaticSale;
