import React, { useState, useEffect } from 'react';
import Style from './CurrentAuction.module.scss';
import Image from 'next/image';

import {
	FaArrowLeft,
	FaArrowRight,
	FaUserCircle,
	FaCheckCircle,
	FaTimesCircle,
} from 'react-icons/fa';
import { MdTimer } from 'react-icons/md';

// BLOCKCHAIN & BACKEND IMPORTS
import { db } from '@/firebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import {
	placeBid,
	listenForCreatedAuctions,
	createContractInstance,
	listenForBidEvents,
	loadActiveAuctions,
	callAuctionEndTimeReached,
} from '@/store/blockchainInteractions';

// INTERNAL IMPORTS
import images from '../../../assets/index';
import { useSelector, useDispatch } from 'react-redux';
import { AuctionTimer } from '../componentindex';
import { RingLoader } from 'react-spinners';

const CurrentAuction = () => {
	const dispatch = useDispatch();

	const user = useSelector((state) => state.connection.account);
	const auctions = useSelector((state) => state.auctionFactory.auctions);
	const auctionFactoryLoaded = useSelector((state) => state.auctionFactory.isLoaded);
	const auctionFactoryDetails = useSelector((state) => state.auctionFactory.contractDetails);
	const marketplaceDetails = useSelector((state) => state.marketplace.contractDetails);

	const [homepage, setHomepage] = useState(true);
	const [loading, setLoading] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentAuction, setCurrentAuction] = useState(
		auctions.length > 0 ? auctions[currentIndex] : null,
	);
	const [nftData, setNftData] = useState(null);
	const [seller, setSeller] = useState(null);
	const [sellerImage, setSellerImage] = useState(null);
	const [sellerAccount, setSellerAccount] = useState(null);
	const [bidAmount, setBidAmount] = useState(null);
	const [bidding, setBidding] = useState(false);

	useEffect(() => {
		const loadListeners = async () => {
			const contract = await createContractInstance(auctionFactoryDetails);
			await loadActiveAuctions(dispatch);
			await listenForCreatedAuctions(dispatch, contract);
			await listenForBidEvents(dispatch, currentAuction.auctionAddress, currentAuction.nftId);
		};

		if (auctionFactoryLoaded && currentAuction) loadListeners();
	}, [dispatch]);

	useEffect(() => {
		if (auctions.length > 0) {
			setCurrentAuction(auctions[currentIndex]);
		}
	}, [currentIndex, auctions]);

	useEffect(() => {
		if (currentAuction) {
			getUserData(currentAuction.nftId);
		}
	}, [currentAuction]);

	const togglePreviousAuction = () => {
		setCurrentIndex((prevIndex) => {
			const newIndex = (prevIndex - 1 + auctions.length) % auctions.length;
			return newIndex;
		});
	};

	const toggleNextAuction = () => {
		setCurrentIndex((prevIndex) => {
			const newIndex = (prevIndex + 1) % auctions.length;
			return newIndex;
		});
	};

	const getUserData = async (nftId) => {
		try {
			setLoading(true);
			const usersRef = collection(db, 'users');
			const querySnapshot = await getDocs(query(usersRef));
			let seller;
			let sellerAccount;
			let nftData;
			let sellerImage;

			querySnapshot.forEach((doc) => {
				const userData = doc.data();
				if (userData.ownedNFTs && userData.ownedNFTs[nftId]) {
					seller = userData.displayName;
					sellerImage = userData.profilePicture;
					sellerAccount = doc.id;
					nftData = userData.ownedNFTs[nftId];
				}
			});

			setNftData(nftData);
			setSeller(seller);
			setSellerImage(sellerImage);
			setSellerAccount(sellerAccount);

			setLoading(false);
		} catch (error) {
			console.error('Could not find owner of auctioned NFT: ', error);
		}
	};

	const handleEndTimeReached = async () => {
		try {
			setLoading(true);

			await callAuctionEndTimeReached(
				dispatch,
				currentAuction.nftId,
				currentAuction.auctionAddress,
			);

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

	const handleAuctionBid = async () => {
		try {
			if (user.account === sellerAccount) {
				window.alert('You are the owner of this NFT');
				return;
			}

			setLoading(true);
			await placeBid(currentAuction.auctionAddress, bidAmount);

			setTimeout(() => {
				setLoading(false);
				toggleBidding();
			}, 1500);
		} catch (error) {
			console.error('Failed to place bid on auction.');
		}
	};

	const toggleBidding = () => {
		setBidding(!bidding);
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
								<>
									{currentAuction && sellerImage ? (
										<Image
											src={sellerImage}
											alt='account image of nft seller'
											className={Style.auction_container_wrapper_creator_img}
											width={50}
											height={50}
										/>
									) : (
										<FaUserCircle
											size={60}
											className={Style.auction_container_wrapper_creator_img}
										/>
									)}
								</>
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
							<div className={Style.auction_container_bid_wrapper}>
								<p>{currentAuction && currentAuction.currentBid ? 'Current Bid:' : 'No Bids'}</p>
								<p>
									{currentAuction && currentAuction.currentBid ? currentAuction.currentBid : '0'}
								</p>
								<Image
									src={images.eth}
									alt='eth symbol'
									className={Style.auction_container_bid_wrapper_icon}
								/>
							</div>
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
								{bidding ? (
									<div className={Style.auction_container_interact_confirm}>
										<input
											type='text'
											onChange={(e) => setBidAmount(e.target.value)}
											placeholder='ETH Amount'
										/>
										<div className={Style.auction_container_interact_confirm_wrapper}>
											<button onClick={handleAuctionBid}>
												<FaCheckCircle />
											</button>
											<button onClick={toggleBidding}>
												<FaTimesCircle />
											</button>
										</div>
									</div>
								) : (
									<button className={Style.auction_container_interact_btn} onClick={toggleBidding}>
										Bid
									</button>
								)}
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
