import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// INTERNAL IMPORT
import Style from './Sidebar.module.scss';
import images from '../../../assets/index';
import { Discover, HelpCenter } from '../Navbar/index';

const Sidebar = ({ onHideSidebar }) => {
	const [discover, setDiscover] = useState(false);
	const [help, setHelp] = useState(false);

	const discoverTimeout = useRef(null);
	const helpTimeout = useRef(null);

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
		<div className={Style.sidebar}>
			{/* DISCOVER */}
			<div className={Style.sidebar_discover} onMouseEnter={handleDiscoverEnter} onMouseLeave={handleDiscoverLeave}>
				<p>Discover</p>
				{discover && (
					<div className={Style.sidebar_discover_box}>
						<Discover onHideDiscover={() => setDiscover(false)} />
					</div>
				)}
			</div>

			{/* HELP CENTER */}
			<div className={Style.sidebar_help} onMouseEnter={handleHelpEnter} onMouseLeave={handleHelpLeave}>
				<p>Help Center</p>
				{help && (
					<div className={Style.sidebar_help_box}>
						<HelpCenter onHideHelp={() => setHelp(false)} />
					</div>
				)}
			</div>
		</div>
	);
};

export default Sidebar;
