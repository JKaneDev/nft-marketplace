// pages/_app.js
import './globals.scss';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';
import { BackgroundVideo } from '../app/components/componentindex';
require('dotenv').config();

function MyApp({ Component, pageProps }) {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<BackgroundVideo />
				<Component {...pageProps} />
			</PersistGate>
		</Provider>
	);
}

export default MyApp;
