'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './Profile.module.scss';
import images from '../../../assets/index';

// BLOCKCHAIN & BACKEND IMPORTS
import { ethers } from 'ethers';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig.js';

import { FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';

const Profile = () => {
	const [profileData, setProfileData] = useState({
		displayName: '',
		emailAddress: '',
		description: '',
		website: '',
		twitterHandle: '',
		facebookHandle: '',
		instagramHandle: '',
		linkedInHandle: '',
		profilePicture: '',
		walletAddress: '',
	});

	useEffect(() => {
		// fetch user data when component mounts and set it to state
		const getWalletAddress = async () => {
			if (window.ethereum) {
				const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
				// const provider = new ethers.provider.Web3Provider(window.ethereum);
				const signer = await provider.getSigner();
				return await signer.getAddress();
			}
			return null;
		};

		const fetchUserData = async () => {
			console.log('walletAddress:', await getWalletAddress());

			const userRef = doc(db, 'users', await getWalletAddress());
			const docSnap = await getDoc(userRef);
			if (docSnap.exists()) {
				setProfileData(docSnap.data());
			}
		};

		fetchUserData();
	}, []);

	const getWalletAddress = async () => {
		if (window.ethereum) {
			const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
			// const provider = new ethers.provider.Web3Provider(window.ethereum);
			const signer = await provider.getSigner();
			return await signer.getAddress();
		}
		return null;
	};

	const handleDataChange = (e) => {
		const { name, value } = e.target;
		setProfileData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleEditProfile = async () => {
		try {
			const userRef = doc(db, 'users', profileData.walletAddress);
			await updateDoc(userRef, profileData);
			alert('Profile updated');
		} catch (error) {
			console.error('Error updating profile: ', error);
		}
	};

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
					{profileData.profilePicture ? (
						<img src={profileData.profilePicture} alt='selected profile pic' />
					) : (
						<Image src={images.placeholder} alt='user profile picture' className={Style.profile_edit_wrapper_image} />
					)}
				</div>

				<div className={Style.profile_edit_info}>
					<div className={Style.profile_edit_info_wrapper}>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Display Name</p>
							<input
								name='displayName'
								value={profileData.displayName}
								type='text'
								placeholder='John Smith '
								onChange={handleDataChange}
							/>
						</div>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Email</p>
							<input
								value={profileData.emailAddress}
								name='emailAddress'
								type='text'
								placeholder='username@provider.region'
								onChange={handleDataChange}
							/>
						</div>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Description</p>
							<textarea value={profileData.description} name='description' type='text' onChange={handleDataChange} />
						</div>
						<div className={Style.profile_edit_info_wrapper_field}>
							<p>Website</p>
							<input
								value={profileData.website}
								name='website'
								type='text'
								placeholder='yourdomainname.com'
								onChange={handleDataChange}
							/>
						</div>
					</div>

					{/* SOCIALS */}
					<div className={Style.profile_edit_info_socials}>
						<p>Socials</p>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input
								value={profileData.twitterHandle}
								name='twitterHandle'
								type='text'
								placeholder='https://twitter.com/yourtwitterhandle'
								onChange={handleDataChange}
							/>
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaTwitter className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input
								value={profileData.facebookHandle}
								name='facebookHandle'
								type='text'
								placeholder='http://facebook.com/yourfacebookhandle'
								onChange={handleDataChange}
							/>
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaFacebook className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input
								value={profileData.instagramHandle}
								name='instagramHandle'
								type='text'
								placeholder='@yourinstragramhandle'
								onChange={handleDataChange}
							/>
							<div className={Style.profile_edit_info_socials_wrapper_icons}>
								<FaInstagram className={Style.profile_edit_info_socials_wrapper_icons_icon} />
							</div>
						</div>
						<div className={Style.profile_edit_info_socials_wrapper}>
							<input
								value={profileData.linkedInHandle}
								name='linkedInHandle'
								type='text'
								placeholder='https://www.linkedin.com/yourlinkedinhandle'
								onChange={handleDataChange}
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
							readOnly
							type='text'
							placeholder='0x12528dA349ba828A49583A96b30EeB0A85F696d5'
							value={profileData.walletAddress}
						/>
					</div>

					<button className={Style.profile_edit_info_edit} onClick={handleEditProfile}>
						Edit Profile
					</button>
				</div>
			</div>
		</div>
	);
};

export default Profile;
