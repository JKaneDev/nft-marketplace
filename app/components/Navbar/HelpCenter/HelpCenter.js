import React, { useEffect } from 'react';
import Link from 'next/link';

// INTERNAL IMPORTS
import Style from './HelpCenter.module.scss';

const HelpCenter = ({ onHideHelp }) => {
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

	useEffect(() => {
		console.log('Help Mounted');
	}, []);

	return (
		<div className={Style.helpCenter} onMouseLeave={onHideHelp}>
			{helpCenter.map((el, i) => (
				<div className={Style.helpCenter_links} key={i + 1}>
					<Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
				</div>
			))}
		</div>
	);
};

export default HelpCenter;
