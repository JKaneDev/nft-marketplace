require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
	solidity: '0.8.19',

	paths: {
		artifacts: './abis/',
	},

	networks: {
		sepolia: {
			url: 'https://sepolia.infura.io/v3/dffffa008d21447d91d7a5e4c5c97cd5',
			accounts: [process.env.SEPOLIA_PRIVATE_KEY],
		},
	},
};
