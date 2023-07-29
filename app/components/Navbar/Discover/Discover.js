import React from 'react';
import Link from 'next/link';

// INTERNAL IMPORTS
import Style from './Discover.module.scss';

const Discover = () => {
	// DISCOVER NAVIGATION MENU
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

	return (
		<div className={Style.discover}>
			{discover.map((el, i) => (
				<div key={i + 1} className={Style.discover_links}>
					<Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
				</div>
			))}
		</div>
	);
};

export default Discover;
