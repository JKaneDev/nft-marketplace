export const validateInput = (data) => {
	const errors = {};

	// Check image is rendered
	if (!data.image) {
		errors.image = 'Please select an image';
	}

	// Validate display name
	if (data.displayName) {
		const validNamePattern = /^[a-zA-Z\s&-]{1,20}$/;
		if (!validNamePattern.test(data.displayName)) {
			errors.displayName = 'Text Only. 20 Characters Max*';
		}
	}

	// Validate description
	if (data.description) {
		const validDescription = /^[a-zA-Z0-9\s&-]{1,200}$/;
		if (!validDescription.test(data.description)) {
			errors.description = '200 Alphanumeric Characters max.';
		}
	}

	// Validate royalties
	if (data.royalties) {
		const validRoyalties = /^(10(\.0)?|[0-9](\.\d)?)$/;
		if (!validRoyalties.test(data.royalties)) {
			errors.royalties = 'Integer or single decimal number < 10';
		}
	}

	// Validate properties
	if (data.properties) {
		const validProperties = /^([a-zA-Z-]+)(,\s*[a-zA-Z-]+)*\s*$/;
		if (!validProperties.test(data.properties)) {
			errors.properties = 'Comma separated words only';
		}
	}

	// Validate price
	if (data.price) {
		const validEthPrice = /^(9999|0\.0{0,2}[1-9]\d{0,2}|[1-9]\d{0,2}(\.\d{1,5})?)$/;
		if (!validEthPrice.test(data.price)) {
			errors.price = 'ETH value from 0.001 - 9999';
		}
	}

	return errors;
};
