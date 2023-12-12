// EXTERNAL IMPORTS
import React, { useState } from 'react';
import Style from './StaticSaleCard.module.scss';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';

// INTERNAL IMPORTS
import images from '../../../../assets/index';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { useSelector } from 'react-redux';
import { createContractInstance, getSigner, purchaseNft } from '@/store/blockchainInteractions';

const StaticSaleCard = ({ id, name, image, category, price }) => {
	const user = useSelector((state) => state.connection.account);
	const marketplaceDetails = useSelector((state) => state.marketplace.contractDetails);

	const [purchasing, setPurchasing] = useState(false);
	const [inWatchlist, setInWatchlist] = useState(false);

	const handleNftPurchase = async () => {
		const marketplace = await createContractInstance(marketplaceDetails);
		await purchaseNft(marketplace, id, user);
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
				<div className={Style.card_img_wrapper}>
					<FaHeart size={18} className={Style.card_img_like} />
				</div>
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
					{purchasing ? <RingLoader size={30} color={'#fff'} /> : <button onClick={handleNftPurchase}>Purchase</button>}
				</div>
			</div>
		</div>
	);
};

export default StaticSaleCard;
