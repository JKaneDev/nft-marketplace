import React from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './Notification.module.scss';
import images from '../../../../assets/index';

const Notification = () => {
	return (
		<div className={Style.Notification}>
			<p>Notification</p>
			<div className={Style.notification_box}>
				<div className={Style.notification_box_img}>
					<Image src={images.user1} alt='profile-img' width={50} height={50} className={Style.notification_box_img} />
				</div>
				<div className={Style.notification_box_info}>
					<h4>James Kane</h4>
					<p>Latest User Activity</p>
					<small>3 Minutes ago</small>
					<span className={Style.notification_box_new}></span>
				</div>
			</div>
		</div>
	);
};

export default Notification;
