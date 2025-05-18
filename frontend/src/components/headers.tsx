import React from "react";
import { Link } from "react-router-dom";

export const siteKey = "6Lf-7hwrAAAAAJfpGT5ZQUZYd-hAZVjLZx6aJEl9";

const Header: React.FC = () => {

	return (
		<header className="w-full bg-black text-white py-10 px-10 flex items-center justify-between">

		  	<div className="flex items-center">
			<h1 className="text-5xl font-extrabold tracking-tight text-green-500">
			 	ft_transcendence
			</h1>
		  	</div>
	
		  	<ul className="flex space-x-8">
				<Link
					to="/"
					className="bg-black px-3 py-2 text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					Home
				</Link>
				<Link
					to="/login"
					className="bg-black px-3 py-2 text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					Login
				</Link>
				<Link
					to="/register"
					className="bg-black px-3 py-2 text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					Register
				</Link>
			</ul>
			
		</header>
	  );
}

export default Header;
