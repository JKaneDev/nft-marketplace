import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import GavelIcon from '@mui/icons-material/Gavel';
import StorefrontIcon from '@mui/icons-material/Storefront';

import Style from './MarketItem.module.scss';

const SaleToggle = ({ saleType, setSaleType }) => {
	const handleSaleType = (event, newSaleType) => {
		if (newSaleType !== null) {
			setSaleType(newSaleType);
		}
	};

	return (
		<div className={Style.toggle}>
			<ToggleButtonGroup
				value={saleType}
				exclusive
				onChange={handleSaleType}
				aria-label='sale type'
			>
				<ToggleButton
					value='static'
					aria-label='static sale'
					className={`${Style.toggle_btns} ${saleType === 'static' ? Style.selected : ''}`}
				>
					<StorefrontIcon className={Style.toggle_icons} />
				</ToggleButton>
				<ToggleButton
					value='auction'
					aria-label='auction'
					className={`${Style.toggle_btns} ${saleType === 'auction' ? Style.selected : ''}`}
				>
					<GavelIcon className={Style.toggle_icons} />
				</ToggleButton>
			</ToggleButtonGroup>
		</div>
	);
};

export default SaleToggle;
