'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// BLOCKCHAIN + STORAGE + STATE IMPORTS
import { ethers } from 'ethers';
import { uploadMetadata, uploadImageToIpfs } from '../../../pages/api/ipfs';
import { loadMarketplaceContract, connectToEthereum } from '@/store/blockchainInteractions';
import { useSelector, useDispatch } from 'react-redux';

// INTERNAL IMPORTS
import Style from './CreateNFT.module.scss';
import images from '../../../assets/index';
import { validateInput } from './utils';

const CreateNFT = () => {
	const dispatch = useDispatch();
	const account = useSelector((state) => state.connection.account);
	const isConnected = useSelector((state) => state.connection.isConnected);
	const [contractDetails, setContractDetails] = useState({ address: null, abi: null });

	const [nftData, setNftData] = useState({
		displayName: '',
		siteLink: '',
		description: '',
		royalties: '',
		properties: '',
		price: '',
		category: null,
		image: null,
	});

	const [validationErrors, setValidationErrors] = useState({});

	const categories = ['Digital Art', 'Gaming', 'Sport', 'Photography', 'Music'];

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

	const setImageToState = (e) => {
		const file = e.target.files[0];
		const fileUrl = URL.createObjectURL(file);

		setNftData((prevState) => ({
			...prevState,
			imagePreview: fileUrl,
			image: file,
		}));
	};

	const createNft = async (metadata) => {
		if (isConnected) {
			try {
				const marketplace = await loadMarketplaceContract(dispatch);

				const imageCID = await uploadImageToIpfs(metadata.image);

				// Remove siteLink and image preview URL - add imageUrl before upload
				const { siteLink, imagePreview, ...metadataToUpload } = metadata;
				metadataToUpload.image = imageCID;

				const validationErrors = validateInput(metadataToUpload);

				if (Object.keys(validationErrors).length === 0) {
					const metadataCID = await uploadMetadata(metadataToUpload);

					const newTokenId = await marketplace.createToken(metadataCID, metadata.price);

					if (!newTokenId) throw new Error('Failed to create NFT token');

					return newTokenId;
				} else {
					console.error('Validation Errors: ', validationErrors);
				}
			} catch (error) {
				console.error('Error in createNFT: ', error);
			}
		} else {
			await connectToEthereum(dispatch);
			window.alert('Check MetaMask connection and call Mint again.');
		}
	};

	return (
		<div className={Style.main}>
			<div className={Style.main_upload}>
				<h1>Create an NFT</h1>
				<p>Once your item is minted you won't be able to change any of it's information</p>
				<div className={Style.main_upload_container} onClick={triggerFileInput}>
					<input type='file' id='fileInput' style={{ display: 'none' }} onChange={setImageToState} />
					{nftData.imagePreview ? (
						<img src={nftData.imagePreview} alt='Uploaded Preview' />
					) : (
						<div className={Style.main_upload_container_params}>
							<Image src={images.upload} alt='upload placeholder'></Image>
							<p>Upload Image</p>
							<p>Browse Files</p>
							<p>Max Size: 10mb</p>
							<p>JPG, JPEG, SVG, PNG</p>
						</div>
					)}
				</div>
				<button className={Style.main_upload_mint} onClick={() => createNft(nftData)}>
					Mint
				</button>
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
					<Image src={images.percentage} className={Style.main_info_wrapper_percentage} alt='% Symbol' />
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
					<Image src={images.eth} className={Style.main_info_wrapper_eth} alt='ETH symbol' />
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
									checked={nftData.category === category}
									onChange={(e) => handleInputChange('category', e.target.value)}
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
