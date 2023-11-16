import '../pages/globals.scss';
import { Navbar, Footer } from './components/componentindex';

const Layout = ({ children }) => {
	return (
		<div>
			<Navbar />
			{children}
			<Footer />
		</div>
	);
};

export default Layout;
