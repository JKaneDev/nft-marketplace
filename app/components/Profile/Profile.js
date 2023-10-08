'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './Profile.module.scss';
import images from '../../../assets/index';

import { FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';

const Profile = () => {
	return (
		<div className={Style.profile}>
			<div className={Style.profile_header}>
				<h1>Edit Profile</h1>
				<p>
					Set your name, profile picture and other information so that other platform user's can interact with you. Or
					just leave it blank, we respect your desire for anonymity!
				</p>
			</div>
			<div className={Style.profile_edit}>
				<div className={Style.profile_edit_wrapper}>
					<Image src={images.placeholder} alt='user profile picture' className={Style.profile_edit_wrapper_image} />
				</div>

				<div className={Style.profile_edit_info}>
					<div className={Style.profile_edit_info_wrapper}>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Display Name</p>
							<input type='text' placeholder='John Smith ' />
						</div>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Email</p>
							<input type='text' placeholder='username@provider.region' />
						</div>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Description</p>
							<textarea type='text' />
						</div>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Website</p>
							<input type='text' placeholder='yourdomainname.com' />
						</div>
					</div>

					{/* SOCIALS */}
					<div className={Style.profile_edit_info_socials}>
						<p>Socials</p>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input type='text' placeholder='https://twitter.com/yourtwitterhandle' />
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaTwitter className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input type='text' placeholder='http://faceboook.com/yourfacebookhandle' />
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaFacebook className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input type='text' placeholder='@yourinstragramhandle' />
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaInstagram className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input type='text' placeholder='https://www.linkedin.com/yourlinkedinhandle' />
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaLinkedin className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
					</div>
					{/* END OF SOCIALS */}

					<div className={Style.profile_edit_info_wallet}>
						<p>Wallet Address</p>
						<input type='text' placeholder='0x12528dA349ba828A49583A96b30EeB0A85F696d5' />
					</div>

					<button className={Style.profile_edit_info_edit}>Edit Profile</button>
				</div>
			</div>
		</div>
	);
};

export default Profile;
