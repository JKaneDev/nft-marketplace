import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ICON IMPORTS
import { MdNotifications, MdStickyNote2 } from 'react-icons/md';
import { BsSearch } from 'react-icons/bs';
import { CgMenuLeft, CgMenuRight } from 'react-icons/cg';

// INTERNAL IMPORTS
import Style from './Navbar.module.scss';
import images from '../../../assets/index.js';
import { Discover, HelpCenter, Notification, Profile, Sidebar } from './index';
import { Button } from '../componentindex';

const Navbar = () => {
	const [discover, setDiscover] = useState(false);
	const [notification, setNotification] = useState(false);
	const [help, setHelp] = useState(false);
	const [profile, setProfile] = useState(false);
	const [openSideMenu, setOpenSideMenu] = useState(false);

	const openMenu = (e) => {
		const btnText = e.target.innerText;

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

	return (
		<div className={Style.navbar}>
			<div className={Style.navbar_container}>
				<div className={Style.navbar_container_left}>
					<div className={Style.logo}>
						<Image src={images.logo} alt='NFT Marketplace Logo' width={100} height={100}></Image>
					</div>
					<div className={Style.navbar_container_left_box_input}>
						<div className={Style.navbar_container_left_box_input_box}>
							<input type='text' placeholder='Search NFT' />
							<BsSearch onClick={() => {}} className={Style.search_icon} />
						</div>
					</div>
				</div>
				{/* END OF LEFT SECTION */}
				<div className={Style.navbar_container_right}>
					<div className={Style.navbar_container_right}>
						<div className={Style.navbar_container_right_discover}>
							<p onClick={(e) => {}}></p>
							<div className={Style.navbar_container_right_discover_box}>
								<Discover />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
