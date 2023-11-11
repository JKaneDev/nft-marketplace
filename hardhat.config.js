require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: '0.8.19',

	paths: {
		artifacts: './artifacts/contracts/',
	},

	networks: {
		goerli: {
			url: 'https://goerli.infura.io/v3/dffffa008d21447d91d7a5e4c5c97cd5',
			accounts: [process.env.GOERLI_PRIVATE_KEY],
		},
	},
};
