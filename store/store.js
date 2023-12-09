import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import ethersReducer from './connectSlices.js';
import marketplaceContractReducer from './marketplaceSlices';
import auctionFactoryReducer from './auctionFactorySlices';

const rootReducer = combineReducers({
	connection: ethersReducer,
	marketplace: marketplaceContractReducer,
	auctionFactory: auctionFactoryReducer,
});

const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['connection', 'marketplace', 'auctionFactory'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ['persist/PERSIST'],
			},
		}),
});

export const persistor = persistStore(store);
