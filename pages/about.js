import React from 'react';

// INTERNAL IMPORTS
import '../app/globals.scss';
import { About } from '@/app/components/componentindex';
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
