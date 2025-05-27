import { Link, useNavigate } from "react-router-dom";
import { DeleteUserRequest, deleteUser } from "../services/userApi";
import { useToast } from "../components/toastBar/toastContext";
import UserHeader from "../components/userHeader";
import Background from "../components/background";
import { getUser, User } from "../services/api";
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";


type Match = {
  id: number;
  opponent: string;
  result: 'Win' | 'Loss';
  date: string;
};

const mockMatches: Match[] = [
  { id: 1, opponent: 'PlayerOne', result: 'Win', date: '2025-04-21' },
  { id: 2, opponent: 'PlayerTwo', result: 'Loss', date: '2025-04-20' },
  { id: 3, opponent: 'PlayerThree', result: 'Win', date: '2025-04-18' },
];

const ProfilePage: React.FC = () => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
	  	(async () => {
			const userId = sessionStorage.getItem('activeUserId');
			if (!userId) return;
	
			const fetchedUser = await getUser(userId);
			setUser(fetchedUser);
	  	})();
	}, []);
	
	if (!user) return <div>Loading...</div>;

	const totalMatches = user.wins + user.losses;
	const winRate = totalMatches ? (user.wins / totalMatches) * 100 : 0;

  	return (
    <div className="flex min-h-screen bg-gray-100">
      
	  {/* Left Sidebar */}
      <div className="w-96 bg-green-100 p-6 rounded-lg shadow-md">
        
		{/* Avatar & Name */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={`/${user.avatar}`}
            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-blue-500 shadow"
          />
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500 mt-2">Sirkuspelle.</p>

          <p
            className={`text-sm font-semibold mt-2 ${
              user.onlineStatus ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {user.onlineStatus ? 'Online' : 'Offline'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <Link
            to="/user/edit"
            className="w-full bg-green-500 hover:bg-blue-700 text-white py-2 rounded-md text-center"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Middle Section: Match History */}
      <div className="flex-1 bg-white p-8 mx-4 rounded-lg shadow-md flex flex-col items-center justify-start w-full">
        
		{/* Overall Stats */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overall Stats</h2>
          <div className="flex justify-center text-gray-600 text-lg">
            <p className="font-medium">
              Wins: {user.wins} | Losses: {user.losses} | Winrate: {winRate.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Match History */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Match History</h2>
        <ul className="space-y-6 w-full mx-auto">
          {mockMatches.map((match) => (
            <li
              key={match.id}
              className={`p-6 rounded-md shadow-lg ${
                match.result === 'Win' ? 'bg-green-300' : 'bg-red-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xl font-medium">{match.opponent}</span>
                <span className="text-lg font-bold">{match.result}</span>
              </div>
              <div className="text-sm text-gray-500">{match.date}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;
