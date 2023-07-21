import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ICON IMPORTS
import { MdNotifications } from 'react-icons/md';
import { BsSearch } from 'react-icons/bs';
import { CgMenuLeft, CgMenuRight } from 'react-icons/cg';

// INTERNAL IMPORTS
import Style from './Navbar.module.scss';
import { Discover, HelpCenter, Notification, Profile, Sidebar } from './index';
import { Button } from '../componentindex';
import { isResSent } from 'next/dist/shared/lib/utils';

const Navbar = () => {
	const [discover, setDiscover] = useState(false);
	const [notification, setNotification] = useState(false);
	const [help, setHelp] = useState(false);
	const [profile, setProfile] = useState(false);
	const [openSideMenu, setOpenSideMenu] = useState(false);

	return (
		<div className={Style.navbar}>
			<div className={Style.navbar_container}>
				<div className={Style.navbar_container_left}></div>
			</div>
		</div>
	);
};

export default Navbar;
