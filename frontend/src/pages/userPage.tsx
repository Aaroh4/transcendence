import UserHeader from "../components/userHeader";
// import React, { useEffect, useState } from 'react'; // useState, add the check
import { useNavigate, Link } from "react-router-dom";
import { LogoutRequest, logoutUser } from "../services/userApi";
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
				token: sessionData.refreshToken,
				accToken: sessionData.accessToken
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
		<div className="flex flex-col items-center justify-center gap-6 pt-[30vh] px-[1vw] pb-[30vh]">
  			<div className="flex flex-wrap gap-6 justify-center">

				<Link 
					to="/solo-game"
					className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../singlepong.png" alt="Solo game Icon" className="w-auto h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Local 1vs1</span>
				</Link>

				<Link
					to="/game"
					className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../pong.png" alt="Game Icon" className="w-auto h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Online 1vs1</span>
				</Link>
				<Link
					to="/ai-game"
					className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../AI_board.png" alt="Game Icon" className="w-auto rounded-2xl h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Player vs AI</span>
				</Link>
				<Link
					to="/tournaments"
					className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../tournament.png" alt="Tournament Icon" className="w-auto h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Tournament</span>
				</Link>

				<Link
					to="/user/profile"
					className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../profile.png" alt="Game Icon" className="w-auto h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Player Profile</span>
				</Link>

			</div>

			<button 
				onClick={handleLogout} 
				className="w-100 h-14 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
				Logout
			</button>

		</div>
		</>
	);
};

export default UserPage;