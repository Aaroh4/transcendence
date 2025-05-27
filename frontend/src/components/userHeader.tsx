import React from "react";
import { useState, useEffect } from "react";
import { useToast } from "./toastBar/toastContext";
import {
	getAllUsers,
	getFriends,
	checkPending,
	friendRequest,
	FriendRequestRequest,
	getFriendsRequest,
	acceptRequest,
	declineRequest,
	blockRequest,
	friendActionRequest,
	searchUsers,
	removeFriend
} from "../services/friendApi";
import { Link, useLocation } from "react-router-dom";

// interface UserHeaderProps {
// 	userName: string;
// };

interface FriendSearchProps {
	query: string;
}

interface userList {
	name: string;
	id: number;
	avatar?: string;
}

interface pendingRequestProps {
	name: string;
	id: number;
	avatar?: string;
}

interface friendsList {
	name: string;
	online_status?: number;
	id: number;
	avatar?: string;
}

const UserHeader: React.FC = () => {

	const [userName, setUserName] = useState('');

	useEffect(() => {
		const userId = sessionStorage.getItem('activeUserId');
		if (userId) {
			const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}');
			setUserName(sessionData.name);
		}
	}, []);
	
	const toast = useToast();
	const location = useLocation();
	
	const [searchState, setSearchState] = useState<FriendSearchProps>({query: ''});
	const [userList, setUserList] = useState<userList[]>([]);
	const [pendingRequests, setPendingRequests] = useState<pendingRequestProps[]>([]);
	const [friendsList, setFriendsList] = useState<friendsList[]>([]);
	const [showFriends, setShowFriends] = useState(false);

	const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setSearchState(prevState => ({...prevState, [name]: value}));
	};

	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

	const handleAddFriend = async (friendId: number) => {

		const user: FriendRequestRequest = {
			friendId: friendId,
			accToken: sessionData.accessToken
		};

		const response = await friendRequest(user);

		if (response.status === 200) {
			toast.open(response.error, "success");
			setUserList((prev) => prev.filter((req) => req.id !== friendId));
		} else {
			toast.open(response.error, "error");
		}
	}

	const handleSearch = async (event: React.FormEvent) => {
		event.preventDefault();

		const searchInput: FriendSearchProps = {
			query: searchState.query
		}

		const response = await searchUsers(searchInput);

		if (response.status === 200 && response.users.length !== 0) {
			setUserList(response.users);
			console.log(response.users);
		} else if (response.status === 200 && response.users.length === 0) {
			toast.open("No Users found", "info");
			setSearchState(prevState => ({ ...prevState, query: '' }));
		}
	}

	
	const handleAccept = async (friendId: number) => {
		
		const info: friendActionRequest = {
			accToken: sessionData.accessToken,
			friendId: friendId,
		};
		
		const response = await acceptRequest(info);
		
		if (response.status === 200) {
			toast.open(response.error, "info");
			setPendingRequests((prev) => prev.filter((req) => req.id !== friendId));
			
			const acceptedFriend = pendingRequests.find((req) => req.id === friendId);
			if (!acceptedFriend) return;
		
			setPendingRequests((prev) => prev.filter((req) => req.id !== friendId));
			setFriendsList((prev) => [...prev, acceptedFriend]);
		}
	}

	const handleDecline = async (friendId: number) => {
		
		const info: friendActionRequest = {
			accToken: sessionData.accessToken,
			friendId: friendId,
		};
		
		const response = await declineRequest(info);
		
		if (response.status === 200) {
			toast.open(response.error, "info");
			setPendingRequests((prev) => prev.filter((req) => req.id !== friendId));
		}
	}

	const handleBlock = async (friendId: number) => {

		const info: friendActionRequest = {
			accToken: sessionData.accessToken,
			friendId: friendId,
		};

		const response = await blockRequest(info);

		if (response.status === 200) {
			toast.open(response.error, "info");
			setPendingRequests((prev) => prev.filter((req) => req.id !== friendId));
		}
	}

	const handleRemove = async (friendId: number) => {

		const info: friendActionRequest = {
			accToken: sessionData.accessToken,
			friendId: friendId
		}

		const response = await removeFriend(info);

		if (response.status === 200) {
			setFriendsList((prev) => prev.filter((friend) => friend.id !== friendId));
			toast.open(response.error, "info");
		}
	}

	const handleOpenFriends = async () => {

		if (!showFriends) {

			// const response = await getAllUsers();
			// console.log(response.users);//test log

			// if (Array.isArray(response.users)) {
			// 	sessionStorage.setItem('users', JSON.stringify(response.users));
			// } else {
			// 	toast.open(response.error, "error");
			// 	console.error("Error fetching users:", response);
			// } // changing this to searchUsers endpoint api/users/search

			const token: getFriendsRequest = {
				accToken: sessionData.accessToken,
			}
			
			const response2 = await getFriends(token);

			if (Array.isArray(response2.users) && response2.users.length !== 0) {
				sessionStorage.setItem('friends', JSON.stringify(response2.users));
				console.log(response2.users);//test log

				setFriendsList(response2.users)
			}

			const token2: getFriendsRequest = {
				accToken: sessionData.accessToken,
			}

			const response3 = await checkPending(token2);

			if (response3.status < 204 && Array.isArray(response3.data)) {
				console.log("data from friend request" ,response3.data)
				toast.open("we have pending friend request", "info");
				setPendingRequests(response3.data);
			}

		}
		setShowFriends(prevState => !prevState);
	}

	return (
		<>
		<header className="flex-wrap w-full bg-black text-white py-10 px-10 shadow-lg flex items-center justify-between">

		<div className="flex items-center space-x-10">
			<h1 className="text-5xl font-extrabold tracking-tight text-green-500">
			  Welcome: {userName}
			</h1>
		</div>

		<div className="flex flex-wrap gap-2">
			{location.pathname === '/tour-game' && (
				<div className="bg-black text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 px-3 py-2 transform transition-transform hover:scale-105 duration-100">
					<Link to="/tournaments">
						Tournament page
					</Link>
				</div>
			)}
			{location.pathname !== '/user' &&(
				<div className=" bg-black text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 px-3 py-2 transform transition-transform hover:scale-105 duration-100">
					<Link to="/user">
						User page
					</Link>
				</div>
			)}
			<button
				onClick={handleOpenFriends}
				className=" bg-black text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 px-3 py-2 transform transition-transform hover:scale-105 duration-100"
				>
				Friends
			</button>
		</div>

		</header>

		{showFriends && (
            <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-[#1a1a1a] border-2 border-green-500 p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto flex flex-col">
				
				<div>
					<form onSubmit={handleSearch}>
						<label htmlFor="query" className="block text-sm font-medium text-white">
							Add friends by Username
						</label>
						<div className="flex gap-2">
							<input
								type="text"
								name="query"
								value={searchState.query}
								onChange={handleSearchInputChange}
								className="flex-grow border-2 border-black bg-[#2a2a2a] text-white placeholder-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								required
								placeholder="Enter Username ..."
							/>
							<button
								type="button"
								onClick={() => {
									setSearchState({ query: '' });
									setUserList([]);
								}}
								
								className="bg-gray-400 text-white px-2 py-2 border-2 border-black rounded-md hover:bg-gray-500 transform transition-transform hover:scale-104 duration-100"
							>
								Clear
							</button>
						</div>

						<button
						type="submit"
						className="w-full mt-2 bg-green-600 text-white border-2 border-black py-2 rounded-md hover:bg-green-700 text-center transform transition-transform hover:scale-102 duration-100"
						>
							Search
						</button>
					</form>

					{userList && userList.length > 0 && (
					<div className="w-full bg-[#1a1a1a] mt-1 rounded-md shadow-lg overflow-hidden">
					  <div className="space-y-4 pr-2 flex-grow max-h-96 overflow-y-auto">
						{userList.filter((req) => req.id !== Number(userId) && !friendsList.map(friend => friend.id).includes(req.id))
						  .map((req) => (
						  <div key={req.id} className="flex items-center rounded-md justify-between p-2 hover:bg-[#2a2a2a]">
							<div className="flex items-center space-x-2">
							  <img src={`http://localhost:5001/public/${req.avatar}`} alt="User Avatar" className="w-8 h-8 border border-black rounded-full mr-2" />
							  <span className="text-white">{req.name}</span>
							</div>
							<div className="flex space-x-2">
							  <button
								onClick={() => handleAddFriend(req.id)}
								className="bg-green-600 border-2 border-black text-white px-2 py-1 rounded hover:bg-green-700 transform transition-transform hover:scale-102 duration-100"
							  >
								Add
							  </button>
							</div>
						  </div>
						))}
					  </div>
					</div>
					)}
			
					{pendingRequests && pendingRequests.length > 0 && (
						<div className="w-full px-4 gap-4">
							<h2 className="text-lg font-semibold mb-2 text-white">Pending Requests:</h2>
							{pendingRequests.map((req) => (
								<div key={req.id} className="flex items-center justify-between p-2 rounded mb-2 hover:bg-[#2a2a2a]">
									
								<div className="flex items-center space-x-2">
									<img src={`http://localhost:5001/public/${req.avatar}`} alt="User Avatar" className="w-8 h-8 border border-black rounded-full mr-2" />
									<span className="text-white">{req.name}</span>
								</div>

								<div className="flex space-x-2">
									<button
										onClick={() => handleAccept(req.id)}
										className="bg-green-600 text-white border-2 border-black px-2 py-1 rounded hover:bg-green-700 transform transition-transform hover:scale-103 duration-100"
									>
										Accept
									</button>
									<button
										onClick={() => handleDecline(req.id)}
										className="bg-red-600 text-white border-2 border-black px-2 py-1 rounded hover:bg-red-700 transform transition-transform hover:scale-103 duration-100"
									>
										Decline
									</button>
									<button
										onClick={() => handleBlock(req.id)}
										className="bg-gray-700 text-white border-2 border-black px-2 py-1 rounded hover:bg-gray-900 transform transition-transform hover:scale-103 duration-100"
									>
										Block
									</button>
								</div>

								</div>
							))}
						</div>
					)}

					{friendsList && friendsList.length > 0 && (
					<div className="w-full px-4 gap-4">
						<h2 className="text-lg font-semibold mb-2 text-white">Friends:</h2>
						<div className="space-y-4 pr-2 flex-grow max-h-96 overflow-y-auto">
							{friendsList.map((req) => (
							<div key={req.id} className="flex items-center justify-between p-2 rounded mb-2 hover:bg-[#2a2a2a]">
								<div className="flex items-center">
								<img src={`http://localhost:5001/public/${req.avatar}`} alt="User Avatar" className="w-8 h-8 border border-black rounded-full mr-2" />
								<span className="text-white">{req.name}</span>
								</div>
								
								<div className="flex items-center space-x-2">
								<span
								className={`w-4 h-4 border-2 border-black rounded-full ${
									req.online_status === 1 ? "bg-green-600" : "bg-red-600"
								} inline-block ml-2`}
								/>

								<button
									onClick={() => handleRemove(req.id)}
									className="bg-red-600 text-white border-2 border-black px-2 py-1 rounded hover:bg-red-700 transform transition-transform hover:scale-103 duration-100"
									>
									Remove
								</button>
								</div>

							</div>
							))}
						</div>
					</div>
					)}
				</div>

				<button
					onClick={handleOpenFriends}
					className="border-2 border-black w-full mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 self-end transform transition-transform hover:scale-102 duration-100"
				>
					Close
				</button>

				</div>
			</div>
		)}
		</>
	  );
}

export default UserHeader;