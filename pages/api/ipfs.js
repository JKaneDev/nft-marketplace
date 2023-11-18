import { create } from 'ipfs-http-client';

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

export const uploadImageToIpfs = async (imageFile) => {
	try {
		const formData = new FormData();
		formData.append('file', imageFile);

		const response = await fetch('/api/ipfs', {
			method: 'POST',
			body: formData, // No headers needed, FormData sets the Content-Type
		});

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		const data = await response.json();
		console.log('Image uploaded to IPFS: ', data);
		return data.cid; // Assuming the server responds with the CID
	} catch (error) {
		console.error('Error uploading image to IPFS:', error);
		throw error; // Rethrow the error for handling by the caller
	}
};

// Upload NFT to ipfs
export const uploadMetadata = async (nftData) => {
	try {
		const response = await fetch('/api/ipfs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(nftData),
		});

		const data = await response.json();
		return data.cid;
	} catch (error) {
		console.error('Error in uploadMetadata:', error);
	}
};

const uploadToIpfs = async (data) => {
	try {
		// Check if data is an object and stringify it
		const isObject = typeof data === 'object' && data !== null;
		const dataToUpload = isObject ? JSON.stringify(data) : data;

		const added = await client.add(dataToUpload);
		const cid = added.path;
		return cid;
	} catch (error) {
		console.error('Error uploading to IPFS: ', error);
	}
};

export default async function infura(req, res) {
	// Extract metadata from the request body
	const data = req.body;
	try {
		// Perform the upload to IPFS
		const cid = await uploadToIpfs(data);
		res.status(200).json({ cid });
	} catch (error) {
		res.status(500).json({ message: 'Failed to upload to IPFS', error: error.message });
	}
}
