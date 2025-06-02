import { Link, useNavigate } from "react-router-dom";
import { DeleteUserRequest, deleteUser } from "../services/userApi";
import { useToast } from "../components/toastBar/toastContext";
import UserHeader from "../components/userHeader";
import Background from "../components/background";
import { getUser, User } from "../services/api";
import React, { useEffect, useState } from 'react';
import { getMatchHistory, MatchHistory } from '../services/api';



/*type Match = {
  id: number;
  opponent: string;
  result: 'Win' | 'Loss';
  date: string;
};

const mockMatches: Match[] = [
  { id: 1, opponent: 'PlayerOne', result: 'Win', date: '2025-04-21' },
  { id: 2, opponent: 'PlayerTwo', result: 'Loss', date: '2025-04-20' },
  { id: 3, opponent: 'PlayerThree', result: 'Win', date: '2025-04-18' },
];*/


const ProfilePage: React.FC = () => {
	const [user, setUser] = useState<User | null>(null);
	const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
	const [opponentNames, setOpponentNames] = useState<Record<number, string>>({});

	useEffect(() => {
	(async () => {
		const userId = sessionStorage.getItem('activeUserId')!;
		const sessionData = JSON.parse(sessionStorage.getItem(userId)!);
		const accToken = sessionData.accessToken;

		const fetchedUser = await getUser(userId);
		setUser(fetchedUser);

		const matchResults = await getMatchHistory({ accToken }, userId);
		if (!matchResults.data) 
			return;

		setMatchHistory(matchResults.data);

		const opponentIds = Array.from(
		new Set(matchResults.data.map((match) => match.opponent_id))
		);

		const opponentFetches = opponentIds.map(async (id) => {
		try {
			const opponent = await getUser(String(id));
			return { id, name: opponent.name };
		} catch {
			return { id, name: `User #${id}` };
		}
		});

		const opponentResults = await Promise.all(opponentFetches);
		const nameMap: Record<number, string> = {};
		opponentResults.forEach(({ id, name }) => {
		nameMap[id] = name;
		});

		setOpponentNames(nameMap);
	})();
	}, []);

	
	if (!user) 
		return <div>Loading...</div>;

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
          {/*<p className="text-sm text-gray-500 mt-2">Sirkuspelle.</p>*/}

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
		{matchHistory.length === 0 ? (
		<p className="text-gray-500">No matches found.</p>
		) : (
		<ul className="space-y-6 w-full mx-auto">
			{matchHistory.map((match) => {
			const loggedInUserId = Number(sessionStorage.getItem('activeUserId'));
			const isWin = match.winner_id === loggedInUserId;
			const opponentId = match.opponent_id;
			const opponentName = opponentNames[opponentId] || `User #${opponentId}`;
			const formattedDate = new Date(match.date).toLocaleDateString();

			return (
				<li
				key={match.id}
				className={`p-6 rounded-md shadow-lg ${
					isWin ? 'bg-green-300' : 'bg-red-300'
				}`}
				>
				<div className="flex justify-between items-center mb-2">
					<span className="text-xl font-semibold">You vs. {opponentName}</span>
					<span className="text-lg font-bold">{isWin ? 'Win' : 'Loss'}</span>
				</div>

				<div className="flex justify-between text-md font-medium text-gray-800 mb-1">
					<span>Your Score: <span className="font-bold">{match.user_score}</span></span>
					<span>Opponent Score: <span className="font-bold">{match.opponent_score}</span></span>
				</div>

				<div className="flex justify-between items-center text-sm text-gray-600">
					<span>{formattedDate}</span>
					<span className="bg-gray-300 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">
					{match.match_type}
					</span>
				</div>
				</li>
			);
			})}
		</ul>
		)}
      </div>
    </div>
  );
};

export default ProfilePage;
