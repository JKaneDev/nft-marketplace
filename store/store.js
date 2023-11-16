import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import ethersReducer from './connectSlices.js';
import marketplaceContractReducer from './marketplaceSlices';

const rootReducer = combineReducers({
	connection: ethersReducer,
	marketplace: marketplaceContractReducer,
});

const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['connection', 'marketplace'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({ reducer: persistedReducer });

export const persistor = persistStore(store);
