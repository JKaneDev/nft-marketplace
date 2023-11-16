import { createSlice } from '@reduxjs/toolkit';

const ethersSlice = createSlice({
	name: 'ethers',
	initialState: {
		isConnected: false,
		account: null,
		error: null,
	},
	reducers: {
		connectSuccess: (state, action) => {
			state.isConnected = true;
			state.account = action.payload;
			state.error = null;
		},
		connectFailure: (state, action) => {
			state.isConnected = false;
			state.error = action.payload;
		},
		disconnect: (state) => {
			state.isConnected = false;
			state.account = null;
			state.error = null;
		},
	},
});

export const { connectSuccess, connectFailure, disconnect } = ethersSlice.actions;
export default ethersSlice.reducer;
