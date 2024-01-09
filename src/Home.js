import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
	const navigate = useNavigate();
	const navigateToMap = (e) => {
		e.preventDefault();
		navigate('map');
	};
	return (
		<div className='ul-view'>
			<ul>
				<li>
					This project to map and track the logistics of automobile vehicle
					transportation was developed using React.js and Leaflet.js
				</li>
				<li>
					<a href='https://leafletjs.com/' target='_blank'>
						Leaflet.js
					</a>{' '}
					is an open-source JavaScript library for mobile-friendly interactive
					map
				</li>
				<li>
					The data plotted on the Map and displayed on the List View is
					simulated to demonstrate overall functionality of the required feature
					including interaction between the map and the list view
				</li>
				<li>
					Feature can be evaluated by navigating to
					<a onClick={navigateToMap}> Map</a> page.
				</li>
			</ul>
		</div>
	);
};

export default Home;
