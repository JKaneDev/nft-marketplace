import React from 'react';
import Image from 'next/image';
import { images } from '@/next.config';

// INTERNAL IMPORTS
import Style from './Button.module.scss';

const Button = ({ btnText, icon }) => {
	return (
		<div className={Style.btn}>
			<Image src={icon} alt='Create NFT' className={Style.icon} />
			<span>{btnText}</span>
		</div>
	);
};

export default Button;
