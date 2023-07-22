import './globals.css';

// INTERNAL IMPORTS
import { Navbar } from './components/componentindex';

const RootLayout = ({ children }) => (
	<div>
		<Navbar />
		{children}
	</div>
);

export default RootLayout;
