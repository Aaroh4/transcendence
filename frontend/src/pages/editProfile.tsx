import React, { useState, useEffect, useRef } from 'react';
import { getUser, User } from "../services/api";
import { deleteUser } from '../services/api';
import { useNavigate } from "react-router-dom";
import { uploadAvatar } from '../services/api'; 
import { updateUser } from '../services/api';
import { updatePassword } from '../services/api';

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

	const handleSubmitChange = async (e: React.FormEvent) => {
		e.preventDefault();
		const userId = sessionStorage.getItem('activeUserId');
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
		const accToken = sessionData.accessToken;

		setMessage('');
		
		if (newValue !== confirmValue) {
			setMessage(changeMode === 'password' ? 'Passwords do not match!' : 'Usernames do not match!');
			return;
		}

		if (changeMode === 'username') {
			
			try {
			const response = await updateUser({
				accToken,
				name: newValue,
				email: user.email,
				number: "0", //?
				password: "0", //?
			}, userId);

			if (response.status >= 200 && response.status < 300) {
				setMessage('Username updated successfully!');
				setChangeMode(null);
				setNewValue('');
				setConfirmValue('');
			} else {
				throw new Error(response.error || 'Update failed');
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
				return;
			}
			
			try {
			const response = await updatePassword({
				accToken,
				name: user.name,
				email: user.email,
				number: "0", //?
				password: newValue,
			}, userId);

			if (response.status >= 200 && response.status < 300) {
				setMessage('Password updated successfully!');
				setChangeMode(null);
				setNewValue('');
				setConfirmValue('');
			} else {
				throw new Error(response.error || 'Update failed');
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

		try {
			const response = await uploadAvatar({ file, accToken });

			if (response.status >= 300) {
				throw new Error(response.error || 'Upload failed');
			}

			setMessage('Avatar updated successfully!');
		} catch (error) {
			console.error(error);
			setMessage('Failed to upload avatar.');
		}
	};

	return (
		<>
			<div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg flex flex-col md:flex-row gap-8">
				
				{/* Left Panel */}
				<div className="md:w-1/3 space-y-4 border-r pr-6">
					<div>
						<h3 className="font-semibold text-gray-700">Username</h3>
						<p className="text-gray-800">{user.name}</p>
						<button onClick={() => setChangeMode('username')} className="text-blue-600 hover:underline text-sm mt-1">
							Change Username
						</button>
					</div>
					<div>
						<h3 className="font-semibold text-gray-700">Email</h3>
						<p className="text-gray-800">{user.email}</p>
					</div>
					<div className="pt-4 space-y-2">
						<div className="space-y-2">
							{!isGoogleUser && (
								<button
									onClick={() => setChangeMode('password')}
									className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
								>
									Change Password
								</button>
							)}
							<button
								onClick={handleFileButtonClick}
								className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
							>
								Change Avatar
							</button>
							<input
								type="file"
								accept="image/*"
								ref={fileInputRef}
								onChange={handleFileChange}
								style={{ display: 'none' }}
							/>
							<button
								onClick={handleDeleteAccount}
								className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
							>
								Delete Account
							</button>
						</div>
					</div>
				</div>

				{/* Center Panel */}
				<div className="md:w-2/3">
					<h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

					{changeMode && (
						<form onSubmit={handleSubmitChange} className="space-y-4 max-w-md">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									{changeMode === 'username' ? 'New Username' : 'New Password'}
								</label>
								<input
									type={changeMode === 'password' ? 'password' : 'text'}
									value={newValue}
									onChange={(e) => setNewValue(e.target.value)}
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Confirm {changeMode === 'username' ? 'New Username' : 'New Password'}
								</label>
								<input
									type={changeMode === 'password' ? 'password' : 'text'}
									value={confirmValue}
									onChange={(e) => setConfirmValue(e.target.value)}
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
								<button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
									Submit Changes
								</button>
							</div>
						</form>
					)}
				</div>
			</div>

			<div className="mt-6 text-center">
				{message && <p className="text-red-500 font-medium">{message}</p>}
			</div>
		</>
	);
};

export default EditProfile;
