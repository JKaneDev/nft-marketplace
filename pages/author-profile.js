import React from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import '../app/globals.scss';
import Style from '../styles/author-profile.module.scss';
import { Navbar, Profile } from '@/app/components/componentindex';

const profile = () => {
	return (
		<div className={Style.profile}>
			<Navbar />
			<Profile />
		</div>
	);
};

export default profile;
