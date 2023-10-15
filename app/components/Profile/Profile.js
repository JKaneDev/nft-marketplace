'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './Profile.module.scss';
import images from '../../../assets/index';

import { FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';

const Profile = () => {
	const [image, setImage] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [email, setEmail] = useState('');
	const [description, setDescription] = useState('');
	const [website, setWebsite] = useState('');
	const [twitter, setTwitter] = useState('');
	const [facebook, setFacebook] = useState('');
	const [instagram, setInstagram] = useState('');
	const [linkedIn, setLinkedIn] = useState('');
	const [walletAddress, setWalletAddress] = useState('');

	const handleProfileUpdate = () => {};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setImage(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const triggerFileInput = () => {
		document.getElementById('fileInput').click();
	};

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
				<div className={Style.profile_edit_wrapper} onClick={triggerFileInput}>
					<input type='file' id='fileInput' style={{ display: 'none' }} onChange={handleImageUpload} />
					{image ? (
						<img src={image} alt='selected profile pic' />
					) : (
						<Image src={images.placeholder} alt='user profile picture' className={Style.profile_edit_wrapper_image} />
					)}
				</div>

				<div className={Style.profile_edit_info}>
					<div className={Style.profile_edit_info_wrapper}>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Display Name</p>
							<input type='text' placeholder='John Smith ' onChange={(e) => setDisplayName(e.target.value)} />
						</div>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Email</p>
							<input type='text' placeholder='username@provider.region' onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Description</p>
							<textarea type='text' onChange={(e) => setDescription(e.target.value)} />
						</div>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Website</p>
							<input type='text' placeholder='yourdomainname.com' onChange={(e) => setWebsite(e.target.value)} />
						</div>
					</div>

					{/* SOCIALS */}
					<div className={Style.profile_edit_info_socials}>
						<p>Socials</p>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input
								type='text'
								placeholder='https://twitter.com/yourtwitterhandle'
								onChange={(e) => setTwitter(e.target.value)}
							/>
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaTwitter className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input
								type='text'
								placeholder='http://facebook.com/yourfacebookhandle'
								onChange={(e) => setFacebook(e.target.value)}
							/>
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaFacebook className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input type='text' placeholder='@yourinstragramhandle' onChange={(e) => setInstagram(e.target.value)} />
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaInstagram className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input
								type='text'
								placeholder='https://www.linkedin.com/yourlinkedinhandle'
								onChange={(e) => setLinkedIn(e.target.value)}
							/>
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaLinkedin className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
					</div>
					{/* END OF SOCIALS */}

					<div className={Style.profile_edit_info_wallet}>
						<p>Wallet Address</p>
						<input
							type='text'
							placeholder='0x12528dA349ba828A49583A96b30EeB0A85F696d5'
							onChange={(e) => setWalletAddress(e.target.value)}
						/>
					</div>

					<button className={Style.profile_edit_info_edit} onClick={handleProfileUpdate}>
						Edit Profile
					</button>
				</div>
			</div>
		</div>
	);
};

export default Profile;
