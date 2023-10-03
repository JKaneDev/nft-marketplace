import React, { useEffect } from 'react';
import Link from 'next/link';

import { BsFillTelephoneFill, BsFillEnvelopeFill } from 'react-icons/bs';
import { BiSolidInfoSquare } from 'react-icons/bi';
import { IoPersonAddSharp } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { RiLoginBoxFill } from 'react-icons/ri';

// INTERNAL IMPORTS
import Style from './HelpCenter.module.scss';

const HelpCenter = ({ onHideHelp }) => {
	const helpCenter = [
		{
			name: 'About',
			link: 'about',
			icon: 'BiSolidInfoSquare',
		},
		{
			name: 'Sign Up',
			link: 'sign-up',
			icon: 'IoPersonAddSharp',
		},
		{
			name: 'Sign In',
			link: 'sign-in',
			icon: 'RiLoginBoxFill',
		},
		{
			name: 'Contact Us',
			link: 'contact-us',
			icon: 'BsFillTelephoneFill',
		},
		{
			name: 'Settings',
			link: 'settings',
			icon: 'IoMdSettings',
		},
	];

	const iconMap = {
		BiSolidInfoSquare: <BiSolidInfoSquare className={Style.icons} />,
		IoPersonAddSharp: <IoPersonAddSharp className={Style.icons} />,
		RiLoginBoxFill: <RiLoginBoxFill className={Style.icons} />,
		BsFillTelephoneFill: <BsFillTelephoneFill className={Style.icons} />,
		IoMdSettings: <IoMdSettings className={Style.icons} />,
	};

	return (
		<div className={Style.helpCenter} onMouseLeave={onHideHelp}>
			{helpCenter.map((el, i) => (
				<div className={Style.helpCenter_links} key={i + 1}>
					<span>{iconMap[el.icon]}</span>
					<Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
				</div>
			))}
		</div>
	);
};

export default HelpCenter;
