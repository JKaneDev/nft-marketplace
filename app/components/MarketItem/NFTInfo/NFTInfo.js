// EXTERNAL IMPORTS
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ethers } from 'ethers';
import { RingLoader } from 'react-spinners';

// INTERNAL IMPORTS
import Style from './NFTInfo.module.scss';
import images from '../../../../assets/index';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { useSelector } from 'react-redux';
import { createContractInstance, getSignerAddress } from '@/store/blockchainInteractions';
import { db } from '../../../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const NFTInfo = ({ id, price, category }) => {
	const [updatingPrice, setUpdatingPrice] = useState(false);
	const [updatedPrice, setUpdatedPrice] = useState(null);
	const [loading, setLoading] = useState(false);

	const user = useSelector((state) => state.connection.account);
	const marketplaceDetails = useSelector((state) => state.marketplace.contractDetails);

	const updateListingPrice = async (e) => {
		setLoading(true);
		// Update in smart contract
		const marketplace = await createContractInstance(marketplaceDetails);
		const newPrice = ethers.parseEther(updatedPrice);
		await marketplace.updateNFTPrice(id, newPrice);

		// Update firebase
		const userRef = doc(db, 'users', user);
		const nftPath = `ownedNFTs.${id}.price`;
		await updateDoc(userRef, {
			[nftPath]: updatedPrice,
		});

		setLoading(false);
		togglePriceUpdate();

		window.location.reload();
	};

	const togglePriceUpdate = () => {
		setUpdatingPrice(!updatingPrice);
	};

	useEffect(() => {
		setUpdatedPrice(price);
	}, []);

	return (
		<div className={Style.wrapper}>
			<div className={Style.wrapper_price}>
				<p>Price:</p>
				{updatingPrice ? (
					<div className={Style.wrapper_price_input}>
						<input type='text' onChange={(e) => setUpdatedPrice(e.target.value)} value={updatedPrice} />
						<Image src={images.eth} className={Style.wrapper_price_input_eth} alt='ETH symbol' />
					</div>
				) : (
					<p className={Style.wrapper_price_current_price}>{price} ETH</p>
				)}
			</div>
			<div className={Style.wrapper_info}>
				<p>{category}</p>
				{updatingPrice && loading ? (
					<RingLoader size={30} color={'#fff'} />
				) : updatingPrice ? (
					<div className={Style.wrapper_info_btns}>
						<button onClick={() => updateListingPrice(updatedPrice)}>
							<FaCheckCircle />
						</button>
						<button onClick={togglePriceUpdate}>
							<FaTimesCircle />
						</button>
					</div>
				) : (
					<button onClick={togglePriceUpdate}>Update Price</button>
				)}
			</div>
		</div>
	);
};

export default NFTInfo;
