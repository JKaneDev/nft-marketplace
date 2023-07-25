import './globals.css';

// INTERNAL IMPORTS
import { Navbar } from './components/componentindex';

const RootLayout = ({ children }) => {
	return (
		<html lang='en'>
			<head>
				<body>{children}</body>
			</head>
		</html>
	);
};

export default RootLayout;
