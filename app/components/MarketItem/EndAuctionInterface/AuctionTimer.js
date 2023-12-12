import React from 'react';
import Countdown from 'react-countdown-now';
import moment from 'moment';

import Style from '../EndAuctionInterface/EndAuctionInterface.module.scss';

function AuctionTimer({ startTime, auctionDuration, handleEndAuction }) {
	// Convert startTime and auctionDuration from string to number
	const startTimeNum = parseInt(startTime, 10);
	const durationNum = parseInt(auctionDuration, 10);

	// Calculate end time (in milliseconds for the countdown timer)
	const endTime = moment.unix(startTimeNum).add(durationNum, 'seconds').valueOf();

	// Renderer for countdown
	const renderer = ({ hours, minutes, seconds, completed }) => {
		if (completed) {
			// Render a completed state
			return <p>00:00:00</p>;
		} else {
			// Render a countdown
			return (
				<span>
					{hours}:{minutes}:{seconds}
				</span>
			);
		}
	};

	return (
		<div className={Style.interface_info_countdown}>
			<Countdown date={endTime} renderer={renderer} onComplete={handleEndAuction} />
		</div>
	);
}

export default AuctionTimer;
