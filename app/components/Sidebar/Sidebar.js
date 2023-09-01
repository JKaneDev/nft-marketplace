import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// INTERNAL IMPORT
import Style from './Sidebar.module.scss';
import images from '../../../assets/index';

const Sidebar = ({ onHideSidebar }) => {
	return (
		<div className={Style.sidebar}>
			<div className={Style.sidebar_box}></div>
		</div>
	);
};

export default Sidebar;
