import { db, storage } from '../../firebaseConfig';
import {
	doc,
	updateDoc,
	getDocs,
	query,
	getDoc,
	deleteField,
	collection,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadImageToFirebase = async (image, displayName, tokenId, walletAddress) => {
	try {
		// Create a unique file name using displayName and tokenId
		const fileName = `${displayName}_${tokenId}`;

		// Create a reference to the Firebase Storage
		const imageRef = ref(storage, `OwnedNFTImages/${walletAddress}/${fileName}`);

		// Upload the image
		await uploadBytes(imageRef, image);

		// Get the download URL
		const imageUrl = await getDownloadURL(imageRef);

		console.log('Firebase image upload successful');

		return imageUrl;
	} catch (error) {
		console.error('Error uploading image to Firebase:', error);
		throw error;
	}
};

export const updateFirebaseWithNFT = async (
	firebaseImageUrl,
	metadata,
	tokenId,
	userWalletAddress,
) => {
	try {
		// Define the NFT metadata object for Firebase
		const nftDataForFirebase = {
			id: tokenId.toString(),
			name: metadata.displayName,
			description: metadata.description,
			properties: metadata.properties,
			price: metadata.price,
			category: metadata.category,
			image: firebaseImageUrl,
			isListed: true,
		};

		// Get a reference to the user's document in Firestore
		const userRef = doc(db, 'users', userWalletAddress);

		// Update the user's document with the new NFT data

		if (userRef) {
			await updateDoc(userRef, {
				[`ownedNFTs.${tokenId}`]: nftDataForFirebase,
			});
		}
	} catch (error) {
		console.error('Error updating Firebase with NFT:', error);
		throw error;
	}
};

export const listNFT = async (seller, nftId) => {
	try {
		// Reference to the user's document
		const userRef = doc(db, 'users', seller);

		// Get the current data of the user
		const userDoc = await getDoc(userRef);
		if (userDoc.exists()) {
			const userData = userDoc.data();

			// Check if the NFT exists in the map
			if (userData.ownedNFTs && userData.ownedNFTs[nftId]) {
				// Path to the specific NFT
				const nftPath = `ownedNFTs.${nftId}.isListed`;

				// Check if the NFT is already listed
				if (!userData.ownedNFTs[nftId].isListed) {
					// Update the isListed property of the specific NFT
					await updateDoc(userRef, {
						[nftPath]: true,
					});

					console.log('NFT Listed');
				}
			}
		}
	} catch (error) {
		console.error('Error listing NFT:', error);
	}
};

export const delistNFT = async (seller, nftId) => {
	try {
		// Reference to the user's document
		const userRef = doc(db, 'users', seller);

		// Get the current data of the user
		const userDoc = await getDoc(userRef);
		if (userDoc.exists()) {
			const userData = userDoc.data();

			// Check if the NFT exists in the map
			if (userData.ownedNFTs && userData.ownedNFTs[nftId]) {
				// Path to the specific NFT
				const nftPath = `ownedNFTs.${nftId}.isListed`;

				// Check if the NFT is already delisted
				if (userData.ownedNFTs[nftId].isListed) {
					// Update the isListed property of the specific NFT
					await updateDoc(userRef, {
						[nftPath]: false,
					});

					console.log('NFT Delisted');
				}
			}
		}
	} catch (error) {
		console.error('Error delisting NFT:', error);
	}
};

export const changeNftOwnershipInFirebase = async (id, buyer) => {
	try {
		// Step 1: Find the current owner of the NFT
		const usersRef = collection(db, 'users');
		const querySnapshot = await getDocs(query(usersRef));
		let seller = '';
		let nftData;

		querySnapshot.forEach((doc) => {
			const userData = doc.data();
			if (userData.ownedNFTs && userData.ownedNFTs[id]) {
				seller = doc.id;
				nftData = userData.ownedNFTs[id];
			}
		});

		if (!seller) {
			console.log('NFT not found in any user account.');
			return;
		}

		// Step 2: Remove NFT from seller's ownedNFTs map
		const sellerRef = doc(db, 'users', seller);
		await updateDoc(sellerRef, {
			[`ownedNFTs.${id}`]: deleteField(),
		});

		// Step 3: Add NFT to buyer's ownedNFTs map
		const buyerRef = doc(db, 'users', buyer);
		await updateDoc(buyerRef, {
			[`ownedNFTs.${id}`]: nftData,
		});

		console.log('NFT ownership updated successfully in Firebase.');
	} catch (error) {
		console.error('Error updating NFT ownership in Firebase:', error);
	}
};

export const changePrice = async (nftId, seller, newPrice) => {
	try {
		const userRef = doc(db, 'users', seller);
		const userDoc = await getDoc(userRef);
		const data = userDoc.data();

		await updateDoc(userRef, {
			[`ownedNFTs.${nftId}.price`]: newPrice,
		});
	} catch (error) {
		console.error('Error updating nft with new price: ', error);
	}
};
