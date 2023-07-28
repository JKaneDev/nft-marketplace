import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GrClose } from 'react-icons/gr';
import {
	TiSocialFacebook,
	TiSocialLinkedIn,
	TiSocialTwitter,
	TiSocialYoutube,
	TiSocialInstagram,
	TiArrowSortedDown,
	TiArrowSortedUp,
} from 'react-icons/ti';

// INTERNAL IMPORT
import Style from './Sidebar.module.scss';
import images from '../../../assets/index';
import { Button } from '../Button/Button';
import { FaStaylinked } from 'react-icons/fa';

const Sidebar = ({ setOpenSideMenu }) => {
	// ---------TOGGLE COMPONENTS
	const [openDiscover, setOpenDiscover] = useState(false);
	const [openHelp, setOpenHelp] = useState(false);

	// ---------DISCOVER NAVIGATION MENU
	const discover = [
		{
			name: 'Collection',
			link: 'collection',
		},
		{
			name: 'Author Profile',
			link: 'author-profile',
		},
		{
			name: 'NFT Details',
			link: 'NFT-details',
		},
		{
			name: 'Account Setting',
			link: 'account-setting',
		},
		{
			name: 'Connect Wallet',
			link: 'connect-wallet',
		},
		{
			name: 'Blog',
			link: 'blog',
		},
	];

	// --------- HELP CENTER NAV MENU
	const helpCenter = [
		{
			name: 'About',
			link: 'about',
		},
		{
			name: 'Contact Us',
			link: 'contact-us',
		},
		{
			name: 'Sign Up',
			link: 'sign-up',
		},
		{
			name: 'Sign In',
			link: 'sign-in',
		},
		{
			name: 'Subscription',
			link: 'subscription',
		},
	];

	const openDiscoverMenu = () => {
		if (!openDiscover) {
			setOpenDiscover(true);
		} else {
			setOpenDiscover(false);
		}
	};

	const openHelpMenu = () => {
		if (!openHelp) {
			setOpenHelp(true);
		} else {
			setOpenHelp(false);
		}
	};

	const closeSidebar = () => {
		setOpenSideMenu(false);
	};

	return (
		<div className={Style.sideBar}>
			<GrClose className={Style.sideBar_closeBtn} onClick={() => closeSidebar()} />

			<div className={Style.sideBar_box}>
				<Image src={images.logo} alt='logo' width={150} height={150} />
				<p>Discover top-rated articles on trending NFT projects</p>
				<div className={Style.sideBar_social}>
					<a href='#'>
						<TiSocialFacebook />
					</a>
					<a href='#'>
						<TiSocialLinkedIn />
					</a>
					<a href='#'>
						<TiSocialTwitter />
					</a>
					<a href='#'>
						<TiSocialYoutube />
					</a>
					<a href='#'>
						<TiSocialInstagram />
					</a>
				</div>
			</div>

			<div className={Style.sideBar_menu}>
				<div>
					<div className={Style.sideBar_menu_box} onClick={() => openDiscover()}>
						<p>Discover</p>
						<TiArrowSortedDown />
					</div>

					{openDiscover && (
						<div className={Style.sideBar_discover}>
							{discover.map((el, i) => (
								<p key={i + 1}>
									<Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
								</p>
							))}
						</div>
					)}
				</div>

				<div>
					<div className={Style.sideBar_menu_box} onClick={() => openHelpMenu()}>
						<p>Help Center</p>
						<TiArrowSortedDown />
					</div>

					{openHelp && (
						<div className={Style.sideBar_discover}>
							{helpCenter.map((el, i) => (
								<p key={i + 1}>
									<Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
								</p>
							))}
						</div>
					)}
				</div>
			</div>

			<div className={Style.sideBar_button}>
				<Button btnName='Create' />
				<Button btnName='Connect Wallet' />
			</div>
		</div>
	);
};

export default Sidebar;
