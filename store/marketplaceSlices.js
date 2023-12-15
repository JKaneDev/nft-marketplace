import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	contractDetails: null,
	isLoaded: false,
	error: null,
};

const marketplaceContractSlice = createSlice({
	name: 'marketplaceContract',
	initialState,
	reducers: {
		setMarketplaceContract: (state, action) => {
			state.contractDetails = action.payload;
			state.isLoaded = true;
			state.error = null;
		},
		unsetMarketplaceContract: (state) => {
			state.contract = null;
			state.isLoaded = false;
		},
		setError: (state, action) => {
			state.error = action.payload;
			state.isLoaded = false;
			state.contractDetails = null;
		},
	},
});

export const { setMarketplaceContract, unsetMarketplaceContract, setError, setWatchlist } =
	marketplaceContractSlice.actions;
export default marketplaceContractSlice.reducer;
