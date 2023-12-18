import React, { useState, useEffect } from 'react';
import Style from './CurrentAuction.module.scss';
import Image from 'next/image';

import { FaArrowLeft, FaArrowRight, FaUserCircle } from 'react-icons/fa';
import { MdTimer } from 'react-icons/md';

// BLOCKCHAIN & BACKEND IMPORTS
import { db } from '@/firebaseConfig';
import { where, collection, query, getDocs } from 'firebase/firestore';
import { callEndAuctionOnComplete } from '@/store/blockchainInteractions';

// INTERNAL IMPORTS
import images from '../../../assets/index';
import { useSelector } from 'react-redux';
import { AuctionTimer } from '../componentindex';
import { RingLoader } from 'react-spinners';

const CurrentAuction = () => {
	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const marketplaceDetails = useSelector((state) => state.marketplace.contractDetails);

	const [homepage, setHomepage] = useState(true);
	const [loading, setLoading] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentAuction, setCurrentAuction] = useState(
		auctions.length > 0 ? auctions[currentIndex] : null,
	);
	const [nftData, setNftData] = useState(null);
	const [seller, setSeller] = useState(null);

	useEffect(() => {
		if (currentAuction) {
			getUserData(currentAuction.nftId);
		}
	}, [currentAuction]);

	const togglePreviousAuction = () => {
		setCurrentIndex((prevIndex) => (prevIndex - 1) % auctions.length);
	};

	const toggleNextAuction = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % auctions.length);
	};

	const getUserData = async (nftId) => {
		try {
			setLoading(true);
			const usersRef = collection(db, 'users');
			const querySnapshot = await getDocs(query(usersRef));
			let seller;
			let nftData;

			querySnapshot.forEach((doc) => {
				const userData = doc.data();
				if (userData.ownedNFTs && userData.ownedNFTs[nftId]) {
					seller = userData.displayName;
					nftData = userData.ownedNFTs[nftId];
				}
			});

			setNftData(nftData);
			setSeller(seller);

			setLoading(false);
		} catch (error) {
			console.error('Could not find owner of auctioned NFT: ', error);
		}
	};

	const handleEndTimeReached = async () => {
		try {
			setLoading(true);

			await callEndAuctionOnComplete(marketplaceDetails, currentAuction.auctionAddress, id);

			setTimeout(() => {
				setLoading(false);
				currentAuction[currentIndex + (1 % auctions.length)]
					? toggleNextAuction()
					: setCurrentAuction(null);
			}, 1500);
		} catch (error) {
			console.error('Error ending auction');
		}
	};

	return (
		<div className={Style.auction}>
			<div className={Style.auction_container}>
				{loading ? (
					<RingLoader size={60} color='#fff' className={Style.loader} />
				) : (
					<>
						<div className={Style.auction_container_title}>
							<h1>{nftData ? nftData.name : 'No Active Auctions'}</h1>
							<div className={Style.auction_container_title_container}>
								<FaArrowLeft
									size={38}
									className={Style.auction_container_title_container_arrows}
									onClick={togglePreviousAuction}
								/>
								<FaArrowRight
									size={38}
									className={Style.auction_container_title_container_arrows}
									onClick={toggleNextAuction}
								/>
							</div>
						</div>
						<div className={Style.auction_container_wrapper}>
							<div className={Style.auction_container_wrapper_creator}>
								<FaUserCircle size={38} className={Style.auction_container_wrapper_creator_img} />
								<p>Creator</p>
								<p>{seller ? seller : 'Unknown'}</p>
							</div>
							<br className={Style.br} />
							<div className={Style.auction_container_wrapper_collection}>
								<FaUserCircle size={38} className={Style.auction_container_wrapper_creator_img} />
								<p>Category</p>
								<p>{nftData ? nftData.category : 'Unknown'}</p>
							</div>
						</div>
						<div className={Style.auction_container_bid}>
							<p>{currentAuction && currentAuction.currentBid ? 'Current Bid:' : 'No Bids'}</p>
							<p>
								{currentAuction && currentAuction.currentBid ? currentAuction.currentBid : '0 ETH'}
							</p>
						</div>
						<div className={Style.auction_container_time}>
							<div className={Style.auction_container_time_duration}>
								<MdTimer size={38} />
								<p>Time Remaining:</p>
							</div>
							<div className={Style.auction_container_time_remaining}>
								{currentAuction ? (
									<AuctionTimer
										startTime={currentAuction.startTime}
										auctionDuration={currentAuction.auctionDuration}
										handleEndTimeReached={handleEndTimeReached}
										homepage={homepage}
									/>
								) : (
									<AuctionTimer />
								)}
							</div>
							<br />
							<div className={Style.auction_container_interact}>
								<button className={Style.auction_container_interact_btn}>Bid</button>
							</div>
						</div>
					</>
				)}
			</div>

			<div className={Style.auction_nft_wrapper}>
				<Image
					src={nftData ? nftData.image : images.placeholder}
					layout='fill'
					alt='current auction nft image'
					className={Style.auction_nft_wrapper_image}
				/>
			</div>
		</div>
	);
};

export default CurrentAuction;
