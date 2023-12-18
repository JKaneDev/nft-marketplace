import React from 'react';
import Countdown from 'react-countdown-now';
import moment from 'moment';

import Style from './AuctionTimer.module.scss';

function AuctionTimer({ startTime, auctionDuration, handleEndTimeReached, homepage }) {
	// Convert startTime and auctionDuration from string to number
	const startTimeNum = parseInt(startTime, 10);
	const durationNum = parseInt(auctionDuration, 10);

	// Calculate end time (in milliseconds for the countdown timer)
	const endTime = moment.unix(startTimeNum).add(durationNum, 'seconds').valueOf();

	// Renderer for countdown
	const renderer = ({ hours, minutes, seconds, completed }) => {
		const className = homepage
			? Style.interface_info_countdown_home
			: Style.interface_info_countdown;

		if (completed) {
			// Render a completed state
			return <p className={className}>00:00:00</p>;
		} else {
			// Render a countdown
			return (
				<span className={className}>
					{hours}:{minutes}:{seconds}
				</span>
			);
		}
	};

	return <Countdown date={endTime} renderer={renderer} onComplete={handleEndTimeReached} />;
}

export default AuctionTimer;
