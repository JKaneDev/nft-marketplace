'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

// BLOCKCHAIN + BACKEND + REDUX IMPORTS
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig.js';
import { connectToEthereum } from '@/store/blockchainInteractions';
import { useSelector, useDispatch } from 'react-redux';

// ICON IMPORTS
import { BsSearch } from 'react-icons/bs';
import { IoMenu } from 'react-icons/io5';
import { FaPlus, FaPlug } from 'react-icons/fa';

// INTERNAL IMPORTS
import Style from './Navbar.module.scss';
import { Discover, HelpCenter, Sidebar } from './index';

const Navbar = () => {
	const dispatch = useDispatch();
	const isConnected = useSelector((state) => state.connection.isConnected);

	const [discover, setDiscover] = useState(false);
	const [help, setHelp] = useState(false);
	const [sidebar, setSidebar] = useState(false);

	const discoverTimeout = useRef(null);
	const helpTimeout = useRef(null);
	const sidebarTimeout = useRef(null);

	const handleConnect = async () => {
		try {
			connectToEthereum(dispatch);
			loadOrCreateAccount(address);
		} catch (error) {
			console.error('Failed to connect:', error);
		}
	};

	const loadOrCreateAccount = async (walletAddress) => {
		const userRef = doc(db, 'users', walletAddress);
		const docSnap = await getDoc(userRef);

		if (!docSnap.exists()) {
			return docSnap.data();
		} else {
			const newUser = {
				walletAddress: walletAddress,
				profilePicture: '',
				displayName: '',
				emailAddress: '',
				description: '',
				website: '',
				twitterHandle: '',
				facebookHandle: '',
				instagramHandle: '',
				linkedInHandle: '',
				ownedNFTs: [],
				watchlist: [],
				activeBids: [],
			};

			try {
				await setDoc(userRef, newUser);
				console.log('Account created for: ', walletAddress);
			} catch (error) {
				console.error('Error creating user: ', error);
			}
		}
	};

	const handleDiscoverEnter = () => {
		// Clear existing timeout
		if (discoverTimeout.current) {
			clearTimeout(discoverTimeout.current);
		}
		setDiscover(true);
	};

	const handleDiscoverLeave = () => {
		discoverTimeout.current = setTimeout(() => setDiscover(false), 100);
	};

	const handleHelpEnter = () => {
		// Clear existing timeout
		if (helpTimeout.current) {
			clearTimeout(helpTimeout.current);
		}
		setHelp(true);
	};

	const handleHelpLeave = () => {
		helpTimeout.current = setTimeout(() => setHelp(false), 100);
	};

	const handleSidebarEnter = () => {
		if (sidebarTimeout.current) {
			clearTimeout(sidebarTimeout.current);
		}
		setSidebar(true);
	};

	const handleSidebarLeave = () => {
		sidebarTimeout.current = setTimeout(() => setSidebar(false), 100);
	};

	return (
		<div className={Style.navbar}>
			<div className={Style.navbar_container}>
				{/* LOGO CONTAINER */}
				<Link href={{ pathname: '/' }} className={Style.navbar_container_left}>
					<p className={Style.logo}>
						Nifty<span className={Style.logo_colored}>verse</span>
					</p>
				</Link>
				{/* END OF LEFT SECTION */}

				{/* MIDDLE SEARCH BAR SECTION */}
				<div className={Style.navbar_container_middle}>
					{/* SEARCH NFT INPUT BOX */}
					<div className={Style.navbar_container_middle_box_input}>
						<div className={Style.navbar_container_middle_box_input_box}>
							<BsSearch onClick={() => {}} className={Style.search_icon} />
							<input type='text' placeholder='Search NFT' />
						</div>
					</div>
				</div>

				{/* END OF MIDDLE SECTION */}

				<div className={Style.navbar_container_right}>
					{/* DISCOVER MENU */}
					<div
						className={Style.navbar_container_right_discover}
						onMouseEnter={handleDiscoverEnter}
						onMouseLeave={handleDiscoverLeave}
					>
						<p>Discover</p>
						{discover && (
							<div className={Style.navbar_container_right_discover_box}>
								<Discover onHideDiscover={() => setDiscover(false)} />
							</div>
						)}
					</div>

					{/* HELP CENTER */}
					<div
						className={Style.navbar_container_right_help}
						onMouseEnter={handleHelpEnter}
						onMouseLeave={handleHelpLeave}
					>
						<p>Help Center</p>
						{help && (
							<div className={Style.navbar_container_right_help_box}>
								<HelpCenter onHideHelp={() => setHelp(false)} />
							</div>
						)}
					</div>

					{/* CREATE BUTTON SECTION */}
					<Link href={{ pathname: 'create-nft' }} className={Style.navbar_container_right_button}>
						<FaPlus className={Style.navbar_container_right_button_icon} />
						<span>Create</span>
					</Link>

					<div
						className={Style.navbar_container_right_sidebar}
						onMouseEnter={handleSidebarEnter}
						onMouseLeave={handleSidebarLeave}
					>
						<div className={Style.navbar_container_right_sidebar_box}>
							<IoMenu className={Style.sidebarIcon} />
							{sidebar && (
								<div className={Style.navbar_container_right_sidebar_menu}>
									<Sidebar onHideSidebar={() => setSidebar(false)} />
								</div>
							)}
						</div>
					</div>
					{/* Connect Wallet */}
					<button
						className={`${Style.navbar_container_right_connect} ${isConnected ? Style.walletConnectedWrapper : ''}`}
						onClick={handleConnect}
					>
						<FaPlug
							className={`${Style.navbar_container_right_connect_icon} ${isConnected ? Style.walletConnectedIcon : ''}`}
						/>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
