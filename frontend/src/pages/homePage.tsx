import { Link } from 'react-router-dom';
import Header from "../components/headers.js";
import Background from '../components/background.js';
import { useNavigate } from "react-router-dom";
import { useToast } from '../components/toastBar/toastContext.js';
// import { useEffect } from 'react';

const Home: React.FC = () => {

	const navigate = useNavigate();
	const toast = useToast();

	const handleGoogleLogin = () => {

		const popup = window.open(
		  'http://localhost:4000/api/googleauth',
		  'GoogleLogin',
		  'width=500,height=600'
		);
	  
		window.addEventListener('message', (event) => {

		if (event.origin !== "http://localhost:4000")
			return;
	
		const { userId, accessToken, refreshToken } = event.data;

		
	
		if (userId && accessToken) {
			sessionStorage.setItem("activeUserId", userId);
			sessionStorage.setItem(
				userId,
				JSON.stringify({
					accessToken,
					refreshToken,
					error: "Google signin successful",
				})
			);
			navigate("/user");
		} else { 
			toast.open("Google signin failed", "error");
		}
		// console.log('User is now logged in');
		});
	}

	return (
		<>
		<Header />
		<Background/>
			<div className="flex flex-col items-center justify-center gap-6 pt-[30vh] px-[1vw] pb-[30vh]">
  			<div className="flex flex-wrap gap-6 justify-center">
		
				<Link
					to="/login"
					className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
					>
					<img src="../login.png" alt="Login Icon" className="w-2/4 h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Login</span>
				</Link>
		
				<Link
					to="/register"
					className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
					>
					<img src="../register.png" alt="Register Icon" className="w-2/4 h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Register</span>
				</Link>
			
				<button 
					onClick={handleGoogleLogin}
					className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
					<img src="../googleLogo.png" alt="Google Icon" className="w-2/4 h-2/4 mb-2" />
					<span className="text-xl font-bold mt-2">Google sign in</span>
				</button>
		
			</div>
			</div>
		</>
	);
}

export default Home
