'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ICON IMPORTS
import { MdStayCurrentLandscape, MdStickyNote2 } from 'react-icons/md';
import { BsSearch } from 'react-icons/bs';
import { CgMenuLeft, CgMenuRight } from 'react-icons/cg';

// INTERNAL IMPORTS
import Style from './Navbar.module.scss';
import images from '../../../assets/index.js';
import { Discover, HelpCenter, Profile } from './index';
import { Button } from '../componentindex';

const Navbar = () => {
	const [discover, setDiscover] = useState(false);
	const [help, setHelp] = useState(false);
	const [profile, setProfile] = useState(false);

	const discoverTimeout = useRef(null);
	const helpTimeout = useRef(null);
	const notificationTimeout = useRef(null);

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

	return (
		<div className={Style.navbar}>
			<div className={Style.navbar_container}>
				{/* LOGO CONTAINER */}
				<div className={Style.navbar_container_left}>
					<div className={Style.logo}>
						{/* <Image src={images.OpenSea} alt='NFT Marketplace Logo' width={300} height={100} /> */}
					</div>

					{/* SEARCH NFT INPUT BOX */}
					<div className={Style.navbar_container_left_box_input}>
						<div className={Style.navbar_container_left_box_input_box}>
							<input type='text' placeholder='Search NFT' />
							<BsSearch onClick={() => {}} className={Style.search_icon} />
						</div>
					</div>
				</div>

				{/* END OF LEFT SECTION */}

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
						<p onClick={(e) => openMenu(e)}>Help Center</p>
						{help && (
							<div className={Style.navbar_container_right_help_box}>
								<HelpCenter onHideHelp={() => setHelp(false)} />
							</div>
						)}
					</div>

					{/* CREATE BUTTON SECTION */}
					<div className={Style.navbar_container_right_button}>
						<Button icon={images.addIcon} btnText='Create' />
					</div>

					{/* USER PROFILE */}
					<div className={Style.navbar_container_right_profile_box}>
						<div className={Style.navbar_container_right_profile}>
							<Image
								src={images.user1}
								alt='Profile'
								onClick={() => openProfile()}
								className={Style.navbar_container_right_profile}
							/>

							{profile && <Profile />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
