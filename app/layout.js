import '../pages/globals.scss';
import { Navbar, Footer } from './components/componentindex';

const Layout = ({ children }) => {
	return (
		<>
			<Navbar />
			{children}
			<Footer />
		</>
	);
};

export default Layout;
