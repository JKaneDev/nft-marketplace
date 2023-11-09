import './globals.scss';

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
