import React from 'react';
import { NavLink } from 'react-router-dom';
import './../../App.css';
const Header = () => {
	return (
		<div className='header-container'>
			<div className='header-content'>
				<div>
					<NavLink
						to='/home'
						className={({ isActive }) => `links ${isActive && 'active'}`}
					>
						Home
					</NavLink>
				</div>
				<NavLink
					to='/map'
					className={({ isActive }) => `links ${isActive && 'active'}`}
				>
					Map
				</NavLink>
			</div>
		</div>
	);
};

export default Header;
