import React from 'react';

// INTERNAL IMPORTS
import './globals.scss';
import { Contact } from '@/app/components/componentindex';
import Layout from '@/app/layout';

const ContactPage = () => {
	return (
		<>
			<Layout>
				<Contact />
			</Layout>
		</>
	);
};

export default ContactPage;
