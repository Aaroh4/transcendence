import UserHeader from "../components/userHeader";
// import React, { useEffect, useState } from 'react'; // useState, add the check
// import FriendsList from "../components/friendsList";
import { useNavigate, Link } from "react-router-dom";
import { LogoutRequest, logoutUser } from "../services/api";
import { useToast } from "../components/toastBar/toastContext";
import Background from "../components/background";

const UserPage: React.FC = () => {

	const navigate = useNavigate();
	const toast = useToast();

	const handleLogout = async (event: React.MouseEvent) => {

			event.preventDefault();
		
			const userId = sessionStorage.getItem('activeUserId');

			const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

			const user: LogoutRequest = {
				token: sessionData.refreshToken
			};

			console.log("Calling logoutUser API");
			const response = await logoutUser(user);
			console.log("Returning from logoutUser API with status:", response);
	
			if (response.status === 204) {
				sessionStorage.clear();
				toast.open(response.error, "success");
				navigate("/home");
			} else {
				toast.open(response.error, "error");
			}
	};
	
	return (
		<>
		<UserHeader />
		<Background />
		<div className="flex flex-col items-center justify-center gap-6 p-101">
  			<div className="flex gap-6">

				<Link 
					to="/solo-game"
					className="w-50 h-50 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../singlepong.png" alt="Solo game Icon" className="w-auto h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Demo Singleplayer Game</span>
				</Link>

				<Link
					to="/game"
					className="w-50 h-50 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../pong.png" alt="Game Icon" className="w-auto h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Demo Game</span>
				</Link>
				<Link
					to="/ai-game"
					className="w-50 h-50 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500"
				>
					<img src="../pong.png" alt="Game Icon" className="w-auto h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">VS AI Game</span>
				</Link>
				<Link
					to="/tournaments"
					className="w-50 h-50 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../tournament.png" alt="Tournament Icon" className="w-auto h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Tournament</span>
				</Link>

				<Link
					to="/user/profile"
					className="w-50 h-50 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../profile.png" alt="Game Icon" className="w-auto h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Player Profile</span>
				</Link>

			</div>

			<button 
				onClick={handleLogout} 
				className="w-120 h-15 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
				Logout
			</button>

		</div>
		</>
	);
};

export default UserPage;