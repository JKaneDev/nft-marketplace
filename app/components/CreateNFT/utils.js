export const handleImageUpload = async (image, client) => {
	if (!image) return;

	try {
		const imageUrl = await uploadToIpfs(image, client);
		return imageUrl;
	} catch (error) {
		console.error('Failed Image Upload To IPFS');
	}
};

export const uploadToIpfs = async (data, client) => {
	try {
		const added = await client.add(data);
		return `https://ipfs.infura.io/ipfs/${added.path}`;
	} catch (error) {
		console.error('Error uploading to IPFS: ', error);
	}
};

export const uploadMetadata = async (nftData, client) => {
	const validateMetadataBeforeUpload = validateInput(nftData);

	if (Object.keys(validateMetadataBeforeUpload).length === 0) {
		const ipfsUrl = await handleImageUpload(nftData.selectedImage, client);

		if (!ipfsUrl) return;

		const metadata = {
			...nftData,
			imageURL: ipfsUrl,
		};

		const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
		const metadataUrl = await uploadToIpfs(metadataBlob, client);

		return metadataUrl;
	} else {
		console.log('Errors: ', validateMetadataBeforeUpload);
	}
};

export const validateInput = (data) => {
	console.log('Input data: ', data);

	const errors = {};

	// Validate displayName
	if (data.displayName) {
		const validNamePattern = /^[a-zA-Z\s]{1,20}$/; // Adjust regex as needed
		if (!validNamePattern.test(data.displayName)) {
			errors.displayName = 'Text Only. 20 Characters Max*';
		}
	}

	// Validate description
	if (data.description) {
		const validDescription = /^[a-zA-Z0-9\s]{1,200}$/;
		if (!validDescription.test(data.description)) {
			errors.description = '200 Alphanumeric Characters max.';
		}
	}

	// Validate royalties
	if (data.royalties) {
		const validRoyalties = /^(10(\.0)?|[0-9](\.\d)?)$/;
		if (!validRoyalties.test(data.royalties)) {
			errors.royalties = 'Integer or single decimal number < 10';
		}
	}

	// Validate properties
	if (data.properties) {
		const validProperties = /^([a-zA-Z-]+)(,\s*[a-zA-Z-]+)*$/;
		if (!validProperties.test(data.properties)) {
			errors.properties = 'Comma separated words only';
		}
	}

	// Validate price
	if (data.price) {
		const validEthPrice = /^(9999|0\.0{0,2}[1-9]\d{0,2}|[1-9]\d{0,2}(\.\d{1,5})?)$/;
		if (!validEthPrice.test(data.price)) {
			errors.price = 'ETH value from 0.001 - 9999';
		}
	}

	console.log('Errors: ', errors);

	return errors;
};
