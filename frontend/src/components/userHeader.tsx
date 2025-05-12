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
} from "../services/api";

interface UserHeaderProps {
	userName: string;
};

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
				// toast.open("we have pending friend request", "info");
				setPendingRequests(response3.data);
			}

		}
		setShowFriends(prevState => !prevState);
	}

	return (
		<>
		<header className="w-full bg-black text-white py-10 px-10 shadow-lg flex items-center justify-between">

		  <div className="flex items-center space-x-10">
			<h1 className="text-5xl font-extrabold tracking-tight text-green-500">
			  Welcome: {userName}
			</h1>
		  </div>

			<button
				onClick={handleOpenFriends}
				className=" bg-black text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 px-3 py-2 transform transition-transform hover:scale-105 duration-100"
			>
				Friends
			</button>

		</header>

		{showFriends && (
			<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
			 	<div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto flex flex-col">
				
				<div>
					<form onSubmit={handleSearch}>
						<div className="mb-4">
							<label htmlFor="query" className="block text-sm font-medium text-black">
								Add friends by Username
							</label>
							<input
								type="text"
								name="query"
								value={searchState.query}
								onChange={handleSearchInputChange}
								className="w-full border border-black bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								required //fetches all if this is commented out
								placeholder="Enter Username ..."
							/>
						</div>

						<button
						type="submit"
						className="w-full bg-green-500 text-white border border-black py-2 rounded-md hover:bg-green-700 text-center"
						>
							Search
						</button>
					</form>

					{userList && userList.length > 0 && (
					<div className="w-full bg-white mt-1 rounded-md shadow-lg border border-gray-300 overflow-hidden transition-all duration-300 ease-out z-100">
						{userList.filter((req) => req.id !== Number(userId) && !friendsList.map(friend => friend.id).includes(req.id))
							.map((req) => (
						<div key={req.id} className="flex items-center justify-between p-2 hover:bg-gray-100">
							
							<div className="flex items-center space-x-2">
								<img src={`http://localhost:4000/${req.avatar}`} alt="User Avatar" className="w-8 h-8 border border-black rounded-full mr-2" />
								<span className="text-black">{req.name}</span>
							</div>

							<div className="flex space-x-2">
								<button
									onClick={() => handleAddFriend(req.id)}
									className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
								>
									Add
								</button>
							</div>

						</div>
						))}
					</div>
					)}
			
					{pendingRequests && pendingRequests.length > 0 && (
						<div className="w-full px-4 gap-4">
							<h2 className="text-lg font-semibold mb-2 text-black">Pending Requests:</h2>
							{pendingRequests.map((req) => (
								<div key={req.id} className="flex items-center justify-between bg-white p-2 rounded mb-2">
									
								<div className="flex items-center space-x-2">
									<img src={`http://localhost:4000/${req.avatar}`} alt="User Avatar" className="w-8 h-8 border border-black rounded-full mr-2" />
									<span className="text-black">{req.name}</span>
								</div>

								<div className="flex space-x-2">
									<button
										onClick={() => handleAccept(req.id)}
										className="bg-green-500 text-white border border-black px-2 py-1 rounded hover:bg-green-600"
									>
										Accept
									</button>
									<button
										onClick={() => handleDecline(req.id)}
										className="bg-red-500 text-white border border-black px-2 py-1 rounded hover:bg-red-600"
									>
										Decline
									</button>
									<button
										onClick={() => handleBlock(req.id)}
										className="bg-gray-800 text-white border border-black px-2 py-1 rounded hover:bg-black"
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
						<h2 className="text-lg font-semibold mb-2 text-black">Friends:</h2>
							{friendsList.map((req) => (
							<div key={req.id} className="flex items-center justify-between bg-white p-2 rounded mb-2">
								<div className="flex items-center">
								<img src={`http://localhost:4000/${req.avatar}`} alt="User Avatar" className="w-8 h-8 border border-black rounded-full mr-2" />
								<span className="text-black">{req.name}</span>
								</div>
								
								<div className="flex items-center space-x-2">
								<span
								className={`w-4 h-4 border border-black rounded-full ${
									req.online_status === 1 ? "bg-green-600" : "bg-red-500"
								} inline-block ml-2`}
								/>

								<button
									onClick={() => handleRemove(req.id)}
									className="bg-red-500 text-white border border-black px-2 py-1 rounded hover:bg-red-600"
									>
									Remove
								</button>
								</div>

							</div>
							))}
					</div>
					)}
				</div>

				<button
					onClick={handleOpenFriends}
					className="border border-black w-full mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 self-end"
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