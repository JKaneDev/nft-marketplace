// EXTERNAL IMPORTS
import React, { useState, useEffect } from 'react';
import Style from './StaticSaleCard.module.scss';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import { RingLoader } from 'react-spinners';

// INTERNAL IMPORTS
import images from '../../../../assets/index';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { useSelector } from 'react-redux';
import { createContractInstance, purchaseNft } from '@/store/blockchainInteractions';
import { deleteField, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const StaticSaleCard = ({ id, name, image, category, price, isListed, resetUserData }) => {
	const user = useSelector((state) => state.connection.account);
	const marketplaceDetails = useSelector((state) => state.marketplace.contractDetails);

	const [purchasing, setPurchasing] = useState(false);
	const [inWatchlist, setInWatchlist] = useState(false);
	const [purchaseComplete, setPurchaseComplete] = useState(false);

	useEffect(() => {
		const checkWatchlistStatus = async () => {
			const userRef = doc(db, 'users', user.account);
			const userDoc = await getDoc(userRef);
			if (userDoc.exists()) {
				const data = userDoc.data();
				data.watchlist[id] ? setInWatchlist(true) : setInWatchlist(false);
			}
		};
		checkWatchlistStatus();
	}, []);

	useEffect(() => {
		if (purchaseComplete) {
			resetUserData();
		}
	}, [purchaseComplete]);

	const handleNftPurchase = async () => {
		setPurchasing(true);
		const marketplace = await createContractInstance(marketplaceDetails);
		await purchaseNft(marketplace, id, user.account);
		setTimeout(() => {
			setPurchasing(false);
			setPurchaseComplete(true);
			if (inWatchlist) {
				handleWatchlistToggle();
			}
		}, 1500);
	};

	const handleWatchlistToggle = async () => {
		const userRef = doc(db, 'users', user.account);

		if (!inWatchlist) {
			const nftData = {
				id: id,
				name: name,
				image: image,
				category: category,
				price: price,
				isListed: isListed,
			};

			if (userRef) {
				await updateDoc(userRef, {
					[`watchlist.${id}`]: nftData,
				});
				setInWatchlist(true);
			} else {
				console.log('Reference to user does not exist');
			}
		} else {
			await updateDoc(userRef, {
				[`watchlist.${id}`]: deleteField(),
			});
			setInWatchlist(false);
		}
	};

	return (
		<div className={Style.card}>
			<div className={Style.card_img}>
				<Image
					src={image ? image : images.placeholder}
					alt='live auction nft image'
					className={Style.card_img_image}
					width={330}
					height={330}
				/>
				<button className={Style.card_img_wrapper} onClick={handleWatchlistToggle}>
					<FaHeart
						size={18}
						className={Style.card_img_like}
						color={inWatchlist ? 'red' : 'white'}
					/>
				</button>
				<div className={Style.card_img_name}>
					<p>{name ? name : 'Placeholder NFT'}</p>
				</div>
			</div>

			<div className={Style.card_interface}>
				<div className={Style.card_interface_price}>
					<p>Price:</p>
					<p className={Style.card_interface_price_display}>{price} ETH</p>
				</div>
				<div className={Style.card_interface_action}>
					<p>{category}</p>
					{purchasing ? (
						<RingLoader size={30} color={'#fff'} />
					) : (
						<button onClick={handleNftPurchase}>Purchase</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default StaticSaleCard;
