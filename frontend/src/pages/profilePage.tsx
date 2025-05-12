import { Link, useNavigate } from "react-router-dom";
import { DeleteUserRequest, deleteUser } from "../services/api";
import { useToast } from "../components/toastBar/toastContext";
import UserHeader from "../components/userHeader";

const ProfilePage: React.FC = () => {

	const toast = useToast();
	const navigate = useNavigate();

	const handleUserDelete = async (event: React.MouseEvent) => {
	
		event.preventDefault();
	
		const userId = sessionStorage.getItem('activeUserId');
	
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	
		const user: DeleteUserRequest = {
			id: Number(userId),
			accToken: sessionData.accessToken,
			token: sessionData.refreshToken
		};
	
		console.log("Calling deleteUser API");
		const response = await deleteUser(user);
		console.log("Returning from deleteUser API with status:", response);
	
		if (response.status === 200) {
			sessionStorage.clear();
			toast.open(response.error, "success");
			navigate("/home");
		} else {
			toast.open(response.error, "error");
		}	
	}

	return (
		<>
		<UserHeader />

		<div className="flex flex-col items-center justify-center gap-6 p-101">
			<div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
				<Link
					to="/user"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center transition duration-100"
				>
					Back to user page
				</Link>
			</div>

			<div className="bg-black p-6 text-white rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
			<button 
				onClick={handleUserDelete} 
				className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center transition duration-100"
				>
				Delete User
			</button>
			</div>
			<>
			<p>Welcome to the profile page</p>
			</>
		</div>

		</>
	);
};

export default ProfilePage;