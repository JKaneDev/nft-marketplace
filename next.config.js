/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		formats: ['image/avif', 'image/webp'],
		domains: ['firebasestorage.googleapis.com'],
	},
};
module.exports = nextConfig;
