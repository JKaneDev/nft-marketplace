import React, { useEffect } from 'react';
import Link from 'next/link';

import { BsGrid3X3GapFill, BsFillPersonFill, BsFillEyeFill } from 'react-icons/bs';
import { FaWallet, FaBlog } from 'react-icons/fa';

// INTERNAL IMPORTS
import Style from './Discover.module.scss';
import { Button } from '../../componentindex';

const Discover = ({ onHideSubMenu }) => {
	// DISCOVER NAVIGATION MENU
	const discover = [
		{
			name: 'Connect Wallet',
			link: 'connect-wallet',
			icon: 'FaWallet',
		},
		{
			name: 'Collection',
			link: 'collection',
			icon: 'BsGrid3X3GapFill',
		},
		{
			name: 'Profile',
			link: 'author-profile',
			icon: 'BsFillPersonFill',
		},
		{
			name: 'Watchlist',
			link: 'watchlist',
			icon: 'BsFillEyeFill',
		},

		{
			name: 'Blog',
			link: 'blog',
			icon: 'FaBlog',
		},
	];

	const iconMap = {
		BsGrid3X3GapFill: <BsGrid3X3GapFill className={Style.icons} />,
		BsFillPersonFill: <BsFillPersonFill className={Style.icons} />,
		BsFillEyeFill: <BsFillEyeFill className={Style.icons} />,
		FaWallet: <FaWallet className={Style.icons} />,
		FaBlog: <FaBlog className={Style.icons} />,
	};

	return (
		<div className={Style.discover} onMouseLeave={onHideSubMenu}>
			{discover.map((el, i) => (
				<div key={i + 1} className={Style.discover_links}>
					<span className={Style.icon}>{iconMap[el.icon]}</span>
					<Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
				</div>
			))}
		</div>
	);
};

export default Discover;
