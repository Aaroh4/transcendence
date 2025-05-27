import React, { useState, useEffect, useRef } from 'react';
import { getUser, User } from "../services/api";

const EditProfile: React.FC = () => {
	const [message, setMessage] = useState('');
	const [changeMode, setChangeMode] = useState<'username' | 'password' | null>(null);
	const [newValue, setNewValue] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const [confirmValue, setConfirmValue] = useState('');
	const [isGoogleUser, setIsGoogleUser] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

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

	const handleSubmitChange = (e: React.FormEvent) => {
		e.preventDefault();

		setMessage('');
		
		if (newValue !== confirmValue) {
			setMessage(changeMode === 'password' ? 'Passwords do not match!' : 'Usernames do not match!');
			return;
		}

		if (changeMode === 'username') {
			setMessage('Placeholder before making API call');
			return;
		}

		if (changeMode === 'password') {
			setMessage('Placeholder before making API call');
			return;
		}

		setChangeMode(null);
		setNewValue('');
		setConfirmValue('');
	};

	const handleDeleteAccount = () => {
		setMessage('Placeholder');
	};

	const handleFileButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const formData = new FormData();
			formData.append('avatar', file);

			const response = await fetch('/api/upload-avatar', {
				method: 'POST',
				body: formData,
				//place_huld
			});

			if (!response.ok) throw new Error('Upload failed');

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

							{(changeMode === 'username' || changeMode === 'password') && (
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
							)}

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
