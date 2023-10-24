require('@nomicfoundation/hardhat-toolbox');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: '0.8.19',

	networks: {
		goerli: {
			url: 'https://goerli.infura.io/v3/dffffa008d21447d91d7a5e4c5c97cd5',
		},
	},
};
