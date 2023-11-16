import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import ethersReducer from './connectSlices.js';
import marketplaceContractReducer from './marketplaceSlices';

const rootReducer = combineReducers({
	connection: ethersReducer,
	marketplace: marketplaceContractReducer,
});

export const store = configureStore({ reducer: rootReducer });
