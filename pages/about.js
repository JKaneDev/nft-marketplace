import React from 'react';

// INTERNAL IMPORTS
import '../app/globals.scss';
import { Navbar, About, Footer } from '@/app/components/componentindex';

const AboutPage = () => {
	return (
		<>
			<Navbar />
			<About />
			<Footer />
		</>
	);
};

export default AboutPage;
