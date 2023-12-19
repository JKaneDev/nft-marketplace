import React from 'react';

const BackgroundVideo = () => {
	return (
		<video
			autoPlay
			loop
			muted
			style={{
				position: 'fixed',
				width: '100%',
				height: '100%',
				top: 0,
				left: 0,
				zIndex: -1,
				objectFit: 'cover',
			}}
		>
			<source src='/background.mp4' type='video/mp4' />
			Your browser does not support the video tag.
		</video>
	);
};

export default BackgroundVideo;
