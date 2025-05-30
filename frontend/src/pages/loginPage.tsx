import Header, { siteKey } from "../components/headers";
import { LoginRequest, loginUser } from "../services/userApi";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useToast } from "../components/toastBar/toastContext";
import Background from "../components/background";

interface LoginProps {
	email: string;
	password: string;
}

const Login: React.FC = () => {
	const navigate = useNavigate();
	const [captchaError, setcaptchaError] = useState<string | null>(null);
	const [captchaToken, setCaptchaToken] = useState("");
	const [showCaptcha, setCaptcha] = useState(false);
	const toast = useToast();

	const [formState, setFormState] = useState<LoginProps>({
		email: '',
		password: ''
	});

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFormState(prevState => ({...prevState, [name]: value}));
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!captchaToken && !showCaptcha)
		{
			setCaptcha(true);
			return;
		}

		if (!captchaToken) {
		  setcaptchaError("Please complete the CAPTCHA");
		  return ;
		}
		setcaptchaError(null);
	
		const user: LoginRequest = {
		  email: formState.email,
		  password: formState.password,
		  captchaToken: captchaToken
		};

		const response = await loginUser(user, captchaToken);

		const { userId, name, avatar, accessToken, refreshToken, error} = response;
		sessionStorage.setItem('activeUserId', userId.toString());

		if (response.status == 200) {
			// console.log(response);
			sessionStorage.setItem(userId.toString(), JSON.stringify({name, avatar, accessToken, refreshToken, error}));
			navigate("/user");
			toast.open(response.error, "success");
		} else {
			toast.open(response.error, "error");
			setFormState(prevState => ({
				...prevState,
				email: '',
				password: ''
			}));
		}
	};
	return (
		<>
		  	<Header />
			<Background />
		 	 <div className="flex flex-col items-center justify-center gap-6 pt-[30vh] px-[1vw]">
				<div className="bg-[#1a1a1a] border-2 border-green-500 p-6 rounded-lg w-96 flex flex-col gap-4 items-center">
			 	<h1 className="text-2xl font-bold text-center text-white">Login</h1>
				<form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 items-center">

					<div className="w-64">
						<label htmlFor="email" className="block text-sm font-medium text-gray-200">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={formState.email}
							onChange={handleInputChange}
							className="w-full border-2 border-black bg-[#2a2a2a] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							required
						/>
					</div>

					<div className="w-64">
						<label htmlFor="password" className="block text-sm font-medium text-gray-200">
							Password
						</label>
						<input
							type="password"
							name="password"
							value={formState.password}
							onChange={handleInputChange}
							className="w-full border-2 border-black bg-[#2a2a2a] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							required
						/>
					</div>
					{showCaptcha && 
					<ReCAPTCHA
						sitekey={siteKey}
						onChange={(token) => {
							setcaptchaError(null);
							setCaptchaToken(token || "");
						}}
					/> }
					{captchaError && <p style={{ color: 'red' }}>{captchaError}</p>}
					<button
					type="submit"
					className="w-64 border-2 border-black bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-center transform transition-transform hover:scale-102 duration-100"
					>
						Login
					</button>

			  	</form>
				</div>
			</div>
		</>
	);
}

export default Login
