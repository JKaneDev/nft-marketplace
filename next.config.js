/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',

	images: {
		formats: ['image/avif', 'image/webp'],
		domains: ['firebasestorage.googleapis.com'],
	},
};
module.exports = nextConfig;
