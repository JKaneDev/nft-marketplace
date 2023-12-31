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
			const auctionExists = state.auctions.some(
				(auction) =>
					auction.nftId === action.payload.nftId && auction.startTime === action.payload.startTime,
			);

			if (!auctionExists) state.auctions = [...state.auctions, action.payload];
		},
		removeAuction: (state, action) => {
			console.log('removeAuction reducer called');
			const auctionExists = state.auctions.some((auction) => auction.nftId === action.payload);
			if (auctionExists) {
				console.log('Auction exists in state');
				state.auctions = state.auctions.filter((auction) => auction.nftId !== action.payload);
			}
		},
		setAuctions: (state, action) => {
			state.auctions = action.payload;
		},
		bid: (state, action) => {
			const { newBid, address } = action.payload;
			const updatedAuctions = state.auctions.map((auction) => {
				if (auction.auctionAddress === address) {
					return { ...auction, newBid };
				}
				return auction;
			});
			return {
				...state,
				auctions: updatedAuctions,
			};
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
	bid,
} = auctionFactorySlice.actions;
export default auctionFactorySlice.reducer;
