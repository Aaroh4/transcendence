import Header, { siteKey } from "../components/headers";
import { useToast } from "../components/toastBar/toastContext";
import { RegistrationRequest, registerUser } from "../services/api";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

interface RegistrationProps {
	username: string;
	email: string;
	password: string;
	confirm_password: string;
}

const Registration: React.FC = () => {
	const navigate = useNavigate();
	const [captchaError, setcaptchaError] = useState<string | null>(null);
	const [captchaToken, setCaptchaToken] = useState("");
	const [showCaptcha, setCaptcha] = useState(false);
	
	const toast = useToast();

	const [formState, setFormState] = useState<RegistrationProps>({
		username: '',
		email: '',
		password: '',
		confirm_password: ''
	});

	const [passwordError, setPasswordError] = useState<string | null>(null);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFormState(prevState => ({
			...prevState,
			[name]: value
		}));
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

		if (formState.password !== formState.confirm_password) {
			setPasswordError('Passwords do not match');
			return;
		}
		setPasswordError(null); 

		
		const user: RegistrationRequest = {
			name: formState.username,
			email: formState.email,
			password: formState.password,
			captchaToken: captchaToken
		}

		console.log("Calling registerUser API");
		const response = await registerUser(user);
		console.log("Returning from registerUser API call with status: ", response);

		console.log("Toast Context: ", toast);

		if (response.status == 201) {
			toast.open(response.error, "success");
			// console.log(response.error);
			navigate("/login");
		} else {
			toast.open(response.error, "error");
			// console.log(response.error);
			setFormState(prev => ({
				...prev,
				username: '',
				email: ''
			}));
		}
	};


	return (
		<>
			<Header />
			<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
				<h1 className="text-2xl font-bold text-center mb-4 text-gray-900">Register</h1>
				<form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 items-center">
				<div className="w-64">
					<label htmlFor="username" className="block text-sm font-medium text-gray-700">
						Username
					</label>
					<input
						type="text"
						id="username"
						name="username"
						value={formState.username}
						onChange={handleInputChange}
						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>

				<div className="w-64">
					<label htmlFor="username" className="block text-sm font-medium text-gray-700">
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formState.email}
						onChange={handleInputChange}
						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>

				<div className="w-64">
					<label htmlFor="password" className="block text-sm font-medium text-gray-700">
						Password <span className="text-xs text-gray-500">(minimum 8 characters)</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formState.password}
						onChange={handleInputChange}
						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>

				<div className="w-64">
					<label htmlFor="confirm password" className="block text-sm font-medium text-gray-700">
						Confirm password
					</label>
					<input
						type="password"
						id="confirm password"
						name="confirm_password"
						value={formState.confirm_password}
						onChange={handleInputChange}
						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>
				{passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
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
					className="w-64 border border-black bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center transition duration-100"
				>
					Register
				</button>
				</form>
			</div>
			</div>
		</>
	);
}

export default Registration