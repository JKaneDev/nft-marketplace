import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
	apiKey: 'AIzaSyCLRsTtYkAli_SvwX4ji4KjcFOWOF8T2uE',

	authDomain: 'niftyverse-40fdd.firebaseapp.com',

	projectId: 'niftyverse-40fdd',

	storageBucket: 'niftyverse-40fdd.appspot.com',

	messagingSenderId: '488787979150',

	appId: '1:488787979150:web:815aa5589109d86e7f12df',

	measurementId: 'G-30MN9622MR',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app);

export { app, db, auth, storage, realtimeDb };
