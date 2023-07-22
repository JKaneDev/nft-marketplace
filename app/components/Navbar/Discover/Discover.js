import React from 'react';
import Link from 'next/link';

const Discover = () => {
	// --- DISCOVER NAVIGATION MENU
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
			link: 'Connect Wallet',
			name: 'connect-wallet',
		},
		{
			link: 'Blog',
			name: 'blog',
		},
	];

	return (
		<div>
			{discover.map((el, i) => (
				<div key={i + 1} className={Style.discover}>
					<Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
				</div>
			))}
		</div>
	);
};

export default Discover;
