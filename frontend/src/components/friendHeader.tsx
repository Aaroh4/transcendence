import { useEffect, useState } from "react";
import { getUser } from "../services/userApi";
import { useParams, Link } from "react-router-dom";

const FriendHeader: React.FC = () => {

	const { id } = useParams<{ id: string }>();

	const [userName, setUserName] = useState('');
	const [userAvatar, setUserAvatar] = useState<string | null>(null); //default path for 404 fix

	useEffect(() => {
	(async () => {
		if (!id) return;

		const fetchedFriend = await getUser(id);
		setUserName(fetchedFriend.name);
		setUserAvatar(fetchedFriend.avatar);
		
	})();
	}, [id]);

	return (
		<>
		<header className="flex-wrap w-full bg-black text-white py-10 px-10 shadow-lg flex items-center justify-between">

			<div className="flex items-center space-x-10">
				<img
					src={`https://localhost:5001/public/${userAvatar ?? 'avatars/default_avatar.jpg'}`}
					alt="User Avatar"
					className="w-16 h-16 rounded-full object-cover"
				/>
				<h1 className="text-6xl font-extrabold tracking-tight text-green-500">
					{userName}
				</h1>
			</div>
			<div className=" bg-black text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 px-3 py-2 transform transition-transform hover:scale-105 duration-100">
				<Link to="/user">
					User page
				</Link>
			</div>
			
		</header>
		</>
	)
}

export default FriendHeader;