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
		await updateDoc(userRef, {
			ownedNFTs: arrayUnion(nftDataForFirebase),
		});

		console.log('Firebase metadata upload success');
	} catch (error) {
		console.error('Error updating Firebase with NFT:', error);
		throw error;
	}
};

export const toggleNFTListingStatus = async (userWalletAddress, nftId) => {
	try {
		// Reference to the user's document
		const userRef = doc(db, 'users', userWalletAddress);

		// Get the current data of the user
		const userDoc = await getDoc(userRef);
		if (userDoc.exists()) {
			const userData = userDoc.data();

			// Assuming ownedNFTs is a map of NFTs
			const currentIsListedStatus = userData.ownedNFTs[nftId].isListed;

			// Path to the specific NFT
			const nftPath = `ownedNFTs.${nftId}.isListed`;

			// Update the isListed property of the specific NFT
			await updateDoc(userRef, {
				[nftPath]: !currentIsListedStatus,
			});

			console.log('NFT listing status toggled successfully');
		} else {
			console.log('User document does not exist');
		}
	} catch (error) {
		console.error('Error toggling NFT listing status:', error);
	}
};
