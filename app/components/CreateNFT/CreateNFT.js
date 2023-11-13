'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// BLOCKCHAIN AND STORAGE IMPORTS
require('dotenv').config();
import { create } from 'ipfs-http-client';
import { validateInput, uploadMetadata } from './utils';

// INTERNAL IMPORTS
import Style from './CreateNFT.module.scss';
import images from '../../../assets/index';

const CreateNFT = () => {
	const auth =
		'Basic ' + Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET).toString('base64');

	const client = create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: auth,
		},
	});

	const [nftData, setNftData] = useState({
		displayName: '',
		siteLink: '',
		description: '',
		royalties: '',
		properties: '',
		price: '',
		selectedCategory: null,
		selectedImage: null,
	});

	const [validationErrors, setValidationErrors] = useState({});

	const categories = ['Digital Art', 'Gaming', 'Sport', 'Photography', 'Music'];

	useEffect(() => {
		console.log('Validation errors: ', validationErrors);
	}, [validationErrors]);

	// Update metadata object
	const handleInputChange = (field, value) => {
		const errors = validateInput({ ...nftData, [field]: value });
		setValidationErrors(errors);

		setNftData((prevState) => ({
			...prevState,
			[field]: value,
		}));
	};

	const triggerFileInput = () => {
		document.getElementById('fileInput').click();
	};

	// Loads image to <Image />
	const setImageToState = (e) => {
		const file = e.target.files[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setNftData((prevState) => ({
				...prevState,
				selectedImage: reader.result,
			}));
		};
		reader.readAsDataURL(file);
	};

	const createNft = async (metadata, client) => {
		try {
			// Upload metadata to IPFS and get URL
			const metadataUrl = await uploadMetadata(metadata, client);

			if (!metadataUrl) throw new Error('Failed to upload metadata');

			// Call smart contract to mint NFT
			const newTokenId = await createToken(metadataUrl, metadata.price);

			if (!newTokenId) throw new Error('Failed to create NFT token');

			return newTokenId;
		} catch (error) {
			console.error('Error in createNFT: ', error);
		}
	};

	return (
		<div className={Style.main}>
			<div className={Style.main_upload}>
				<h1>Create an NFT</h1>
				<p>Once your item is minted you won't be able to change any of it's information</p>
				<div className={Style.main_upload_container} onClick={triggerFileInput}>
					<input type='file' id='fileInput' style={{ display: 'none' }} onChange={setImageToState} />
					{nftData.selectedImage ? (
						<img src={nftData.selectedImage} alt='Uploaded Preview' />
					) : (
						<div className={Style.main_upload_container_params}>
							<Image src={images.upload}></Image>
							<p>Upload Image</p>
							<p>Browse Files</p>
							<p>Max Size: 10mb</p>
							<p>JPG, JPEG, SVG, PNG</p>
						</div>
					)}
				</div>
				<button className={Style.main_upload_mint}>Mint</button>
				<p>Listing Fee: 0.0025 ETH</p>
			</div>
			<div className={Style.main_info}>
				<div className={Style.main_info_wrapper}>
					<p>Name*</p>
					<input
						type='text'
						placeholder='Dark Magicians'
						onChange={(e) => handleInputChange('displayName', e.target.value)}
					/>
					{validationErrors.displayName && (
						<span className={Style.main_info_wrapper_error}>{validationErrors.displayName}</span>
					)}
				</div>
				<div className={Style.main_info_wrapper}>
					<p>External URL*</p>
					<input
						type='text'
						placeholder='https://darkmagicians.io'
						onChange={(e) => handleInputChange('siteLink', e.target.value)}
					/>
					{validationErrors.siteLink && (
						<span className={Style.main_info_wrapper_error}>{validationErrors.siteLink}</span>
					)}
				</div>
				<div className={Style.main_info_wrapper}>
					<p>Description*</p>
					<textarea
						placeholder='Short description of your NFT'
						onChange={(e) => handleInputChange('description', e.target.value)}
					/>
					{validationErrors.description && (
						<span className={Style.main_info_wrapper_error}>{validationErrors.description}</span>
					)}
				</div>

				<div className={Style.main_info_wrapper}>
					<Image src={images.percentage} className={Style.main_info_wrapper_percentage} />
					<p>Royalties</p>
					<input type='text' placeholder='MAX: 10%' onChange={(e) => handleInputChange('royalties', e.target.value)} />
					{validationErrors.royalties && (
						<span className={Style.main_info_wrapper_error}>{validationErrors.royalties}</span>
					)}
				</div>
				<div className={Style.main_info_wrapper}>
					<p>Properties</p>
					<input
						type='text'
						placeholder='Comma Separated. E.g. "Dark, Sci-Fi, Cyberpunk"'
						onChange={(e) => handleInputChange('properties', e.target.value)}
					/>
					{validationErrors.properties && (
						<span className={Style.main_info_wrapper_error}>{validationErrors.properties}</span>
					)}
				</div>
				<div className={Style.main_info_wrapper}>
					<Image src={images.eth} className={Style.main_info_wrapper_eth} />
					<p>Price*</p>
					<input
						type='text'
						placeholder='ETH Amount: E.g. 2.5'
						onChange={(e) => handleInputChange('price', e.target.value)}
					/>
					{validationErrors.price && <span className={Style.main_info_wrapper_error}>{validationErrors.price}</span>}
				</div>
				<div className={Style.main_info_wrapper} id={Style.categories}>
					<p className={Style.main_info_wrapper_title}>Categories</p>
					<div className={Style.main_info_wrapper_categories}>
						{categories.map((category) => (
							<div key={category} className={Style.main_info_wrapper_categories_select}>
								<p>{category}</p>
								<input
									type='radio'
									name='category'
									value={category}
									checked={nftData.selectedCategory === category}
									onChange={(e) => handleInputChange('selectedCategory', e.target.value)}
								/>
								<label htmlFor={`radio-${category}`} />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateNFT;
