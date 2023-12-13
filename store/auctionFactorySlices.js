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
			if (!state.auctions.includes(action.payload)) {
				state.auctions.push(action.payload);
			} else {
				console.log('Auction already exists in store');
			}
		},
		removeAuction: (state, action) => {
			if (state.auctions.includes(action.payload)) {
				state.auctions = state.auctions.filter((auction) => auction.nftId !== action.payload);
			} else {
				console.log('Auction did not exist');
			}
		},
		setAuctions: (state, action) => {
			console.log('Load auctions payload: ', action.payload);
			state.auctions.push(action.payload);
		},
	},
});

export const {
	setAuctionFactoryContract,
	unsetAuctionFactoryContract,
	setError,
	addAuction,
	setAuctions,
	removeAuction,
} = auctionFactorySlice.actions;
export default auctionFactorySlice.reducer;
