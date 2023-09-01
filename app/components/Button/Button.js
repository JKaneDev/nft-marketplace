import React from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './Button.module.scss';

const Button = ({ btnText, icon }) => {
	return (
		<div className={Style.btn}>
			<Image src={icon} alt='Create NFT' className={Style.icon} width={50} height={50} />
			<span className={Style.text}>{btnText}</span>
		</div>
	);
};

export default Button;
