import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	contractDetails: null,
	isLoaded: false,
	error: null,
	auctions: [],
};

const auctionFactorySlice = createSlice({
	name: 'auctionFactoryContract',
	initialState,
	reducers: {
		setAuctionFactoryContract: (state, action) => {
			state.contractDetails = action.payload;
			state.isLoaded = true;
			state.error = null;
		},
		unsetAuctionFactoryContract: (state) => {
			state.contractDetails = null;
			state.isLoaded = false;
		},
		setError: (state, action) => {
			state.error = action.payload;
			state.isLoaded = false;
			state.contractDetails = null;
		},
		addAuction: (state, action) => {
			state.auctions.push(action.payload);
		},
		setAuctions: (state, action) => {
			state.auctions.push(action.payload);
		},
	},
});

export const { setAuctionFactoryContract, unsetAuctionFactoryContract, setError, addAuction, setAuctions } =
	auctionFactorySlice.actions;
export default auctionFactorySlice.reducer;
