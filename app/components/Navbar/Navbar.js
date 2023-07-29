'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ICON IMPORTS
import { MdNotifications, MdStayCurrentLandscape, MdStickyNote2 } from 'react-icons/md';
import { BsSearch } from 'react-icons/bs';
import { CgMenuLeft, CgMenuRight } from 'react-icons/cg';

// INTERNAL IMPORTS
import Style from './Navbar.module.scss';
import images from '../../../assets/index.js';
import { Discover, HelpCenter, Notification, Profile, Sidebar } from './index';
import { Button } from '../componentindex';

const Navbar = () => {
	const discoverRef = useRef();
	const helpRef = useRef();

	const [discover, setDiscover] = useState(false);
	const [notification, setNotification] = useState(false);
	const [help, setHelp] = useState(false);
	const [profile, setProfile] = useState(false);
	const [openSideMenu, setOpenSideMenu] = useState(false);

	useEffect(() => {
		// closes sub menus if user clicks elsewhere on page
		const handleClickOutside = (e) => {
			if (discoverRef.current && !discoverRef.current.contains(e.target)) {
				setDiscover(false);
			}

			if (helpRef.current && !helpRef.current.contains(e.target)) {
				setHelp(false);
			}
		};

		// attach listeners on mount
		document.addEventListener('mousedown', handleClickOutside);

		// detach listeners on component unmount
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const openMenu = (e) => {
		const btnText = e.target.innerText;

		console.log('Button:', btnText);

		if (btnText == 'Discover') {
			setDiscover(true);
			setHelp(false);
			setNotification(false);
			setProfile(false);
		} else if (btnText == 'Help Center') {
			setDiscover(false);
			setHelp(true);
			setNotification(false);
			setProfile(false);
		} else {
			setDiscover(false);
			setHelp(false);
			setNotification(false);
			setProfile(false);
		}
	};

	const openNotification = () => {
		if (!notification) {
			setNotification(true);
			setDiscover(false);
			setHelp(false);
			setProfile(false);
		} else {
			setNotification(false);
		}
	};

	const openProfile = () => {
		if (!profile) {
			setProfile(true);
			setHelp(false);
			setDiscover(false);
			setNotification(false);
		} else {
			setProfile(false);
		}
	};

	const openSidebar = () => {
		if (!openSideMenu) {
			setOpenSideMenu(true);
		} else {
			setOpenSideMenu(false);
		}
	};

	return (
		<div className={Style.navbar}>
			<div className={Style.navbar_container}>
				{/* LOGO CONTAINER */}
				<div className={Style.navbar_container_left}>
					<div className={Style.logo}>
						<Image src={images.logo} alt='NFT Marketplace Logo' width={300} height={50} />
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
					<div className={Style.navbar_container_right_discover} ref={discoverRef}>
						<p onClick={(e) => openMenu(e)}>Discover</p>
						{discover && (
							<div className={Style.navbar_container_right_discover_box}>
								<Discover />
							</div>
						)}
					</div>

					{/* HELP CENTER */}
					<div className={Style.navbar_container_right_help} ref={helpRef}>
						<p onClick={(e) => openMenu(e)}>Help Center</p>
						{help && (
							<div className={Style.navbar_container_right_help_box}>
								<HelpCenter />
							</div>
						)}
					</div>

					{/* NOTIFICATION */}
					<div className={Style.navbar_container_right_notify}>
						<MdNotifications className={Style.notify} onClick={() => openNotification()} />
						{notification && <Notification />}
					</div>

					{/* CREATE BUTTON SECTION */}
					<div className={Style.navbar_container_right_button}>
						<Button btnText='Create' />
					</div>

					{/* USER PROFILE */}
					<div className={Style.navbar_container_right_profile_box}>
						<div className={Style.navbar_container_right_profile}>
							<Image
								src={images.user1}
								alt='Profile'
								width={40}
								height={40}
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
