import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	contract: null,
	isLoaded: false,
	error: null,
};

const marketplaceContractSlice = createSlice({
	name: 'marketplaceContract',
	initialState,
	reducers: {
		setContract: (state, action) => {
			state.contract = action.payload;
			state.isLoaded = true;
			state.error = null;
		},
		unsetContract: (state) => {
			state.contract = null;
			state.isLoaded = false;
		},
		setError: (state, action) => {
			state.error = action.payload;
			state.isLoaded = false;
			state.contract = null;
		},
	},
});

export const { setContract, unsetContract, setError } = marketplaceContractSlice.actions;
export default marketplaceContractSlice.reducer;
