// import React, { useState } from "react";

// interface FriendRequestProps {
// 	id: string;
// }

// const FriendsList: React.FC = () => {
	
// 	const [formState, setFormState] = useState<FriendRequestProps>({
// 		id: ''
// 	});

// 	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
// 		const { name, value } = event.target;
// 		setFormState(prevState => ({
// 			...prevState,
// 			[name]: value
// 		}));
// 	};

// 	const [visibleState, changeState] = useState(false);
	
// 	const toggleState = () => {
// 		changeState(prevState => !prevState);
// 	};

// 	return (
// 		<div>

// 				<div
// 				className={`absolute left-0 right-0 w-full bg-gray-300 transition-all duration-1000 overflow-hidden ${
// 					visibleState ? "max-h-64" : "max-h-0"
// 				} flex flex-col items-center pt-4 z-100`}
// 				>
// 				<button
// 					onClick={toggleState}
// 					className="mb-4 bg-green-500 text-white px-4 py-2 rounded-md"
// 				>
// 					{visibleState ? "Close" : "Friends"}
// 				</button>

// 				<div className="w-11/12">
// 					<label htmlFor="id" className="block text-sm font-medium text-gray-700">
// 						Add friends by ID
// 					</label>
// 					<input
// 						type="text"
// 						id="id"
// 						name="id"
// 						value={formState.id}
// 						onChange={handleInputChange}
// 						className="border border-black bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
// 						required
// 					/>
// 				</div>

// 			</div>

// 		</div>
// 	  );
// }

// export default FriendsList;