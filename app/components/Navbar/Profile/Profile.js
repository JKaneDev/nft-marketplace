import React from 'react';
import Image from 'next/image';
import { FaUserAlt, FaRegImage, FaUserEdit, FaStaylinked } from 'react-icons/fa';
import { MdHelpCenter } from 'react-icons/md';
import { TbDownloadOff, TbDownload } from 'react-icons/tb';

// INTERNAL IMPORTS
import Style from './Profile.module.scss';

const Profile = () => {
	return (
		<div className={Style.profile}>
			<div className={Style.profile_account}>
				<Image src={images.user1} alt='user profile' width={50} height={50} className={Style.profile_account_img} />
			</div>
			<div className={Style.profile_account_info}>
				<p>James Kane</p>
				<small>X0388374BHBS09843</small>
			</div>
			<div className={Style.profile_menu}>
				<div className={Style.profile_menu_one}>
					<div className={Style.profile_menu_one_item}>
						<FaUserAlt />
						<p>
							<Link href={{ pathname: '/myprofile' }}>My Items</Link>
						</p>
					</div>
					<div className={Style.profile_menu_one_item}>
						<FaUserImage />
						<p>
							<Link href={{ pathname: '/my-items' }}>My Items</Link>
						</p>
					</div>
					<div className={Style.profile_menu_one_item}>
						<FaUserEdit />
						<p>
							<Link href={{ pathname: './edit-profile' }}>Edit Profile</Link>
						</p>
					</div>

					<div className={Style.profile_menu_two}>
						<div className={Style.profile_menu_one_item}>
							<MdHelpCenter />
							<p>
								<Link href={{ pathname: '/help' }}>Help</Link>
							</p>
						</div>
						<div className={Style.profile_menu_one_item}>
							<TbDownload />
							<p>
								<Link href={{ pathname: '/Disconnect' }}>Disconnect</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
