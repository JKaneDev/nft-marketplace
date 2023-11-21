import { db, storage } from '../../firebaseConfig';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
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

		return imageUrl;
	} catch (error) {
		console.error('Error uploading image to Firebase:', error);
		throw error;
	}
};

export const updateFirebaseWithNFT = async (firebaseImageUrl, metadata, tokenId, userWalletAddress) => {
	try {
		// Define the NFT metadata object for Firebase
		const nftDataForFirebase = {
			id: tokenId,
			name: metadata.displayName,
			description: metadata.description,
			properties: metadata.properties,
			price: metadata.price,
			category: metadata.category,
			image: firebaseImageUrl,
		};

		// Get a reference to the user's document in Firestore
		const userRef = doc(db, 'users', userWalletAddress);

		// Update the user's document with the new NFT data
		await updateDoc(userRef, {
			ownedNFTs: arrayUnion(nftDataForFirebase),
		});

		console.log('Firebase metadata upload success');
	} catch (error) {
		console.error('Error updating Firebase with NFT:', error);
		throw error;
	}
};
