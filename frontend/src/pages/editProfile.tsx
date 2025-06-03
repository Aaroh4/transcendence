import React, { useState, useEffect, useRef } from 'react';
import {User } from "../services/api";
import { deleteUser } from '../services/userApi';
import { useNavigate } from "react-router-dom";
import Background from '../components/background';
import UserHeader from '../components/userHeader';
import { useToast } from '../components/toastBar/toastContext';
import {
	updatePassword,
	getUser,
	uploadAvatar,
	updateUser 
} from '../services/userApi';

const EditProfile: React.FC = () => {
	const [message, setMessage] = useState('');
	const [changeMode, setChangeMode] = useState<'username' | 'password' | null>(null);
	const [newValue, setNewValue] = useState('');
	// const [oldPassword, setOldPassword] = useState('');
	const [confirmValue, setConfirmValue] = useState('');
	const [isGoogleUser, setIsGoogleUser] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const navigate = useNavigate();
	const toast = useToast();

	useEffect(() => {
		const googleId = sessionStorage.getItem('googleId');
		if (googleId) {
			setIsGoogleUser(true);
		}
	}, []);

	useEffect(() => {
		(async () => {
			const userId = sessionStorage.getItem('activeUserId');
			if (!userId) return;

			const fetchedUser = await getUser(userId);
			setUser(fetchedUser);
		})();
	}, []);

	if (!user) 
		return <div>Loading...</div>;

	const handleSubmitChange = async (event: React.FormEvent) => {
		event.preventDefault();
		
		const userId = sessionStorage.getItem('activeUserId');
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
		const accToken = sessionData.accessToken;
		const refreshToken = sessionData.refreshToken;

		setMessage('');
		
		if (newValue !== confirmValue) {
			setMessage(changeMode === 'password' ? 'Passwords do not match!' : 'Usernames do not match!');
			toast.open(changeMode === 'password' ? 'Passwords do not match!' : 'Usernames do not match!', "error");
			return;
		}

		if (changeMode === 'username') {
			
			try {
				const response = await updateUser({
					accToken,
					name: newValue,
					email: user.email,
				}, userId);

				if (response.status >= 200 && response.status < 300) {
					setMessage(response.error || 'Username updated successfully!');
					setChangeMode(null);
					setNewValue('');
					setConfirmValue('');
					toast.open(response.error || 'Username updated successfully', "success");
					sessionStorage.removeItem(userId);
					sessionStorage.setItem('activeUserId', userId.toString());
					sessionStorage.setItem(userId.toString(), JSON.stringify({...sessionData, name: newValue, accessToken: accToken, refreshToken: refreshToken}));
				} else {
					toast.open(response.error || 'Username updated failed', "error");
					// throw new Error(response.error || 'Update failed');
					
				}
				} catch (error) {
					setMessage('Failed updating username. Please try again.');
					console.error(error);
			}
			return;
		}

		if (changeMode === 'password') {
			
			if (isGoogleUser) {
				setMessage("YOU CAN'T!!!");
				setChangeMode(null);
				setNewValue('');
				setConfirmValue('');
				toast.open("Not possible", "error");
				return;
			}
			
			try {
			const response = await updatePassword({
				accToken,
				password: newValue,
			}, userId);

			if (response.status >= 200 && response.status < 300) {
				setMessage('Password updated successfully!');
				setChangeMode(null);
				setNewValue('');
				setConfirmValue('');
				toast.open('Password updated successfully', "success");
			} else {
				toast.open(response.error || 'Update failed', "error");
				// throw new Error(response.error || 'Update failed');
			}
			} catch (error) {
				setMessage('Failed updating password. Please try again.');
				console.error(error);
			}
			return;
		}

		setChangeMode(null);
		setNewValue('');
		setConfirmValue('');
		// setOldPassword(''); 
	};

	const handleDeleteAccount = async () => {
		const userId = sessionStorage.getItem('activeUserId');
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
		const accToken = sessionData.accessToken;

		if (!userId || !accToken) {
			setMessage('User not authenticated.');
			return;
		}

		const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
		if (!confirmed) 
			return;

		try {
			await deleteUser({ id: Number(userId), accToken });
			sessionStorage.clear();
			navigate('/'); 
		} catch (err) {
			console.error(err);
			toast.open("Failed to delete account!", "error");
			setMessage('Failed to delete account.');
		}
	};

	const handleFileButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) 
			return;

		const userId = sessionStorage.getItem('activeUserId');
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
		const accToken = sessionData.accessToken;
		const refreshToken = sessionData.refreshToken;

		try {
			const response = await uploadAvatar({ file, accToken });

			if (response.status >= 300) {
				throw new Error(response.error || 'Upload failed');
			}

			setMessage('Avatar updated successfully!');
			toast.open("Avatar updated successfully!", "success")
			sessionStorage.removeItem(userId);
			sessionStorage.setItem('activeUserId', userId.toString());
			sessionStorage.setItem(userId.toString(), JSON.stringify({...sessionData, avatar: response.avatar, accessToken: accToken, refreshToken: refreshToken}));
		} catch (error) {
			console.error(error);
			setMessage('Failed to upload avatar.');
			toast.open("Failed to upload avatar", "error")

		}
	};

	return (
		<>
		<UserHeader />
      	<Background />
        	<div className="flex gap-2 items-center justify-center mt-10 mx-10">
			<div className="w-full max-w-5xl mx-auto border-2 border-black rounded-lg flex flex-col md:flex-row gap-8 bg-[#2a2a2a] p-4">

			<div className="md:w-1/3 space-y-4 border-r pr-6">
					<div>
						<h3 className="font-semibold text-white">Username</h3>
						<p className="text-white">{user.name}</p>
					</div>
					<div>
						<h3 className="font-semibold text-white">Email</h3>
						<p className="text-white">{user.email}</p>
					</div>
					<div className="pt-4">
						
						<div className="space-y-3">
							<button onClick={() => setChangeMode('username')}
								className="w-full bg-gray-400 text-white border-2 border-black py-3 rounded-md hover:bg-gray-500 text-center transform transition-transform hover:scale-102 duration-100"
							>
								Change Username
							</button>
							<button
								onClick={handleFileButtonClick}
								className="w-full bg-gray-400 text-white border-2 border-black py-3 rounded-md hover:bg-gray-500 text-center transform transition-transform hover:scale-102 duration-100"
							>
								Change Avatar
							</button>
							{!isGoogleUser && (
								<button
									onClick={() => setChangeMode('password')}
									className="w-full bg-gray-400 text-white border-2 border-black py-3 rounded-md hover:bg-gray-500 text-center transform transition-transform hover:scale-102 duration-100"
								>
									Change Password
								</button>
							)}
							<input
								type="file"
								accept="image/*"
								ref={fileInputRef}
								onChange={handleFileChange}
								style={{ display: 'none' }}
							/>
							<button
								onClick={handleDeleteAccount}
								className="w-full bg-red-600 text-white border-2 border-black py-3 rounded-md hover:bg-red-700 text-center transform transition-transform hover:scale-102 duration-100"
							>
								Delete Account
							</button>
						</div>

					</div>
				</div>

				{/* Center Panel */}
				<div className="md:w-2/3">
					<h2 className="text-2xl text-white font-bold mb-4">Edit Profile</h2>

					{changeMode && (
						<form onSubmit={handleSubmitChange} className="space-y-4 max-w-md">
							<div>
								<label className="block text-sm font-medium text-gray-200">
									{changeMode === 'username' ? 'New Username' : 'New Password'}
								</label>
								<input
									type={changeMode === 'password' ? 'password' : 'text'}
									value={newValue}
									onChange={(e) => setNewValue(e.target.value)}
									required
									className="w-full border-2 border-black bg-[#2a2a2a] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-200">
									Confirm {changeMode === 'username' ? 'New Username' : 'New Password'}
								</label>
								<input
									type={changeMode === 'password' ? 'password' : 'text'}
									value={confirmValue}
									onChange={(e) => setConfirmValue(e.target.value)}
									required
									className="w-full border-2 border-black bg-[#2a2a2a] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>

							{/* 
							<div>
								<label className="block text-sm font-medium text-gray-700">Current Password</label>
								<input
									type="password"
									value={oldPassword}
									onChange={(e) => setOldPassword(e.target.value)}
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
							*/}

							<div className="pt-2">
								<button type="submit" className="rounded-md p-2 mt-2 bg-green-600 text-white border-2 border-black py-2 hover:bg-green-700 text-center transform transition-transform hover:scale-102 duration-100">
									Submit
								</button>
							</div>
						</form>
					)}
				</div>
			</div>

			</div>
		</>
	);
};

export default EditProfile;
