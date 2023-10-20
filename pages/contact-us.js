import React from 'react';

// INTERNAL IMPORTS
import '../app/globals.scss';
import { Navbar, Contact, Footer } from '@/app/components/componentindex';

const ContactPage = () => {
	return (
		<div>
			<Navbar />
			<Contact />
			<Footer />
		</div>
	);
};

export default ContactPage;
