import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	contract: null,
	isLoaded: false,
	error: null,
};

const auctionFactorySlice = createSlice({
	name: 'auctionFactoryContract',
	initialState,
	reducers: {
		setAuctionFactoryContract: (state, action) => {
			state.contract = action.payload;
			state.isLoaded = true;
			state.error = null;
		},
		unsetAuctionFactoryContract: (state) => {
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

export const { setAuctionFactoryContract, unsetAuctionFactoryContract, setError } = auctionFactorySlice.actions;
export default auctionFactorySlice.reducer;
