import React from 'react';

// INTERNAL IMPORTS
import './globals.scss';
import { About, Footer } from '@/app/components/componentindex';
import Layout from '@/app/layout';

const AboutPage = () => {
	return (
		<>
			<Layout>
				<About />
			</Layout>
		</>
	);
};

export default AboutPage;
