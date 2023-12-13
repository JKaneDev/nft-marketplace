import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
	apiKey: 'AIzaSyCLRsTtYkAli_SvwX4ji4KjcFOWOF8T2uE',
	authDomain: 'niftyverse-40fdd.firebaseapp.com',
	projectId: 'niftyverse-40fdd',
	storageBucket: 'niftyverse-40fdd.appspot.com',
	messagingSenderId: '488787979150',
	appId: '1:488787979150:web:815aa5589109d86e7f12df',
	databaseURL:
		'https://niftyverse-40fdd-default-rtdb.europe-west1.firebasedatabase.app',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app);
const functions = getFunctions(app);
const transferNFTOwnership = httpsCallable(functions, 'transferNFTOwnership');

export { app, db, auth, storage, realtimeDb, functions, transferNFTOwnership };
