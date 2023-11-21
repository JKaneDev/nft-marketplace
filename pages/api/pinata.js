require('dotenv').config();
const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

export default async function handler(req, res) {
	if (req.method === 'POST') {
		try {
			const { cid } = req.body;
			const result = await pinata.pinByHash(cid);
			res.status(200).json({ success: true, data: result });
		} catch (error) {
			console.log('Error pinning: ', error);
			res.status(500).json({ success: false, error: error.message });
		}
	} else {
		res.status(405).json({ success: false, message: 'Could not PIN data by Hash' });
	}
}
