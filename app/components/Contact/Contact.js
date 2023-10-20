import React from 'react';

// INTERNAL IMPORTS
import Style from './Contact.module.scss';

import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';

const Contact = () => {
	const handleEmailSend = () => {};

	return (
		<div className={Style.main}>
			<h1>Contact Us</h1>
			<div className={Style.main_container}>
				<div className={Style.main_container_info}>
					<div className={Style.main_container_info_wrapper}>
						<h3>Address</h3>
						<p>123 Arrakeen Close, Arrakis</p>
					</div>
					<div className={Style.main_container_info_wrapper}>
						<h3>Email</h3>
						<p>example.handle@provider.com</p>
					</div>
					<div className={Style.main_container_info_wrapper}>
						<h3>Phone</h3>
						<p>555-7283-1222</p>
					</div>
					<div className={Style.main_container_info_wrapper}>
						<h3>Socials</h3>
						<div className={Style.main_container_info_wrapper_socials}>
							<div className={Style.main_container_info_wrapper_socials_icons}>
								<FaFacebookF size={18} className={Style.main_container_info_wrapper_socials_icons_icon} />
							</div>
							<div className={Style.main_container_info_wrapper_socials_icons}>
								<FaInstagram size={18} className={Style.main_container_info_wrapper_socials_icons_icon} />
							</div>
							<div className={Style.main_container_info_wrapper_socials_icons}>
								<FaLinkedinIn size={18} className={Style.main_container_info_wrapper_socials_icons_icon} />
							</div>
							<div className={Style.main_container_info_wrapper_socials_icons}>
								<FaTwitter size={18} className={Style.main_container_info_wrapper_socials_icons_icon} />
							</div>
						</div>
					</div>
				</div>
				<div className={Style.main_container_action}>
					<div className={Style.main_container_action_wrapper}>
						<h3>Full Name</h3>
						<input type='text' placeholder='Paul Atreides' />
					</div>
					<div className={Style.main_container_action_wrapper}>
						<h3>Email</h3>
						<input type='text' placeholder='usul.muaddib@gmail.com' />
					</div>
					<div className={Style.main_container_action_wrapper}>
						<h3>Message</h3>
						<textarea type='text' placeholder='Let us know how we can help' />
					</div>
					<button>Send</button>
				</div>
			</div>
		</div>
	);
};

export default Contact;
