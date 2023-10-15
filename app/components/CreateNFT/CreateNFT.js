'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// INTERNAL IMPORTS
import Style from './CreateNFT.module.scss';
import images from '../../../assets/index';

const CreateNFT = () => {
	const [displayName, setDisplayName] = useState('');
	const [siteLink, setSiteLink] = useState('');
	const [description, setDescription] = useState('');
	const [royalties, setRoyalties] = useState('');
	const [price, setPrice] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);

	const handleCategoryChange = (category) => {
		setSelectedCategory(category);
		console.log('Category: ', category);
	};

	const categories = ['Digital Art', 'Gaming', 'Sport', 'Photography', 'Music'];

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setSelectedImage(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const triggerFileInput = () => {
		document.getElementById('fileInput').click();
	};

	return (
		<div className={Style.main}>
			<div className={Style.main_upload}>
				<h1>Create an NFT</h1>
				<p>Once your item is minted you won't be able to change any of it's information</p>
				<div className={Style.main_upload_container} onClick={triggerFileInput}>
					<input type='file' id='fileInput' style={{ display: 'none' }} onChange={handleImageUpload} />
					{selectedImage ? (
						<img src={selectedImage} alt='Uploaded Preview' />
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
			</div>
			<div className={Style.main_info}>
				<div className={Style.main_info_wrapper}>
					<p>Name*</p>
					<input type='text' placeholder='Dark Magicians' onChange={(e) => setDisplayName(e.target.value)} />
				</div>
				<div className={Style.main_info_wrapper}>
					<p>External URL*</p>
					<input type='text' placeholder='https://darkmagicians.io' onChange={(e) => setSiteLink(e.target.value)} />
				</div>
				<div className={Style.main_info_wrapper}>
					<p>Description*</p>
					<textarea placeholder='Short description of your NFT' onChange={(e) => setDescription(e.target.value)} />
				</div>

				<div className={Style.main_info_wrapper}>
					<Image src={images.percentage} className={Style.main_info_wrapper_percentage} />
					<p>Royalties</p>
					<input type='text' placeholder='MAX: 10%' onChange={(e) => setRoyalties(e.target.value)} />
				</div>
				<div className={Style.main_info_wrapper}>
					<p>Properties</p>
					<input
						type='text'
						placeholder='Comma Separated. E.g. "Dark, Sci-Fi, Cyberpunk"'
						onChange={(e) => setProperties(e.target.value)}
					/>
				</div>
				<div className={Style.main_info_wrapper}>
					<Image src={images.eth} className={Style.main_info_wrapper_eth} />
					<p>Price*</p>
					<input type='text' placeholder='ETH Amount: E.g. 2.5' onChange={(e) => setPrice(e.target.value)} />
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
									checked={selectedCategory === category}
									onChange={() => handleCategoryChange(category)}
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
