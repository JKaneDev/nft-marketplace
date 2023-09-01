'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ICON IMPORTS
import { BsSearch } from 'react-icons/bs';
import { IoMenu } from 'react-icons/io5';

// INTERNAL IMPORTS
import Style from './Navbar.module.scss';
import images from '../../../assets/index.js';
import { Discover, HelpCenter, Sidebar } from './index';
import { Button } from '../componentindex';

const Navbar = () => {
	const [discover, setDiscover] = useState(false);
	const [help, setHelp] = useState(false);
	const [sidebar, setSidebar] = useState(false);

	const discoverTimeout = useRef(null);
	const helpTimeout = useRef(null);
	const sidebarTimeout = useRef(null);

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
				<div className={Style.navbar_container_left}>
					<p className={Style.logo}>
						Multi<span className={Style.logo_colored}>verse</span>
					</p>
				</div>
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
					<div className={Style.navbar_container_right_button}>
						<Button icon={images.addIcon} btnText='Create' />
					</div>

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
				</div>
			</div>
		</div>
	);
};

export default Navbar;
