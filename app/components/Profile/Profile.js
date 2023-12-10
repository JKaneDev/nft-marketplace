'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './Profile.module.scss';
import images from '../../../assets/index';
import { getSignerAddress } from '@/store/blockchainInteractions';

// BLOCKCHAIN & BACKEND IMPORTS
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebaseConfig.js';
import dataURLtoBlob from 'dataurl-to-blob';

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

	const [selectedImage, setSelectedImage] = useState(null);

	// FETCH USER DATA VIA FIRESTORE USING WALLET ADDRESS (ON PAGE LOAD)
	useEffect(() => {
		const fetchUserData = async () => {
			const userWalletAddress = await getSignerAddress();
			console.log('Wallet address: ', userWalletAddress);
			const userRef = doc(db, 'users', userWalletAddress);
			const docSnap = await getDoc(userRef);
			if (docSnap.exists()) {
				setProfileData(docSnap.data());
			}
		};

		fetchUserData();
	}, []);

	// HANDLE INFO EDITS IN INPUT FIELD
	const handleDataChange = (e) => {
		const { name, value } = e.target;
		setProfileData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	// CONFIRM EDITS AND SAVE TO FIRESTORE
	const handleEditProfile = async () => {
		try {
			if (selectedImage) {
				await uploadImageToStorage(selectedImage);
			}

			const userRef = doc(db, 'users', profileData.walletAddress);
			await updateDoc(userRef, profileData);
			alert('Profile updated');
		} catch (error) {
			console.error('Error updating profile: ', error);
		}
	};

	// UPLOAD IMAGE TO FIREBASE STORAGE
	const handleImageUpload = (e) => {
		// RETRIEVE IMAGE
		const file = e.target.files[0];
		if (!file) {
			return;
		}

		// INITIALIZE IMAGE READER
		const reader = new FileReader();
		reader.onloadend = () => {
			setSelectedImage(reader.result);
		};

		reader.readAsDataURL(file);
	};

	const checkUserExistence = async (walletAddress) => {
		const userRef = doc(db, 'users', walletAddress);
		const docSnap = await getDoc(userRef);
		return docSnap.exists();
	};

	const uploadImageToStorage = (imageData) => {
		const blob = dataURLtoBlob(selectedImage);
		const storageRef = ref(storage, 'profilePictures/' + profileData.walletAddress);
		const uploadTask = uploadBytesResumable(storageRef, blob);

		uploadTask.on(
			'state_changed',
			(snapshot) => {},
			(error) => {
				console.error('Upload failed:', error);
			},
			() => {
				getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
					saveProfilePictureURLToFirestore(downloadURL);
				});
			},
		);
	};

	// SAVE URL TO FIRESTORE FOR USE IN OTHER COMPONENTS AND PAGES
	function saveProfilePictureURLToFirestore(downloadURL) {
		try {
			const userRef = doc(db, 'users', profileData.walletAddress);
			updateDoc(userRef, {
				profilePicture: downloadURL,
			}).then(() => {
				console.log('Profile picture URL saved to Firestore');
			});
		} catch (error) {
			console.error('Error updating document:', error);
		}
	}

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
					{/* SHOW SELECTED IMAGE IF AVAILABLE */}
					{selectedImage ? (
						<img src={selectedImage} alt='selected profile pic' />
					) : // SHOW STORED PROFILE PICTURE IF AVAILABLE
					profileData.profilePicture ? (
						<img src={profileData.profilePicture} alt='selected profile pic' />
					) : (
						// SHOW PLACEHOLDER IMAGE IF NO OTHER IMAGES AVAILABLE
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
