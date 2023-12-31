import React, { useState } from 'react';
import Link from 'next/link';

import { BsGrid3X3GapFill, BsFillPersonFill, BsFillEyeFill } from 'react-icons/bs';
import { FaWallet, FaBlog, FaPlug } from 'react-icons/fa';
import StorefrontIcon from '@mui/icons-material/Storefront';

// INTERNAL IMPORTS
import Style from './Discover.module.scss';

const Discover = ({ onHideSubMenu }) => {
	const discover = [
		{
			name: 'Marketplace',
			link: 'search-marketplace',
			icon: 'StoreFrontIcon',
		},
		{
			name: 'My Collection',
			link: 'my-collection',
			icon: 'BsGrid3X3GapFill',
		},
		{
			name: 'Edit Profile',
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
		StoreFrontIcon: <StorefrontIcon className={Style.icons} />,
		BsGrid3X3GapFill: <BsGrid3X3GapFill className={Style.icons} />,
		BsFillPersonFill: <BsFillPersonFill className={Style.icons} />,
		BsFillEyeFill: <BsFillEyeFill className={Style.icons} />,
		FaWallet: <FaWallet className={Style.icons} />,
		FaBlog: <FaBlog className={Style.icons} />,
		FaPlug: <FaPlug className={Style.icons} color='green' />,
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
