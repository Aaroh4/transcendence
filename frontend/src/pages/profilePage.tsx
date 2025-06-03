import UserHeader from "../components/userHeader";
import Background from "../components/background";
import { getUser } from "../services/userApi";
import { User } from "../services/api";
import { useEffect, useState } from 'react';
import { MatchHistory } from '../services/api';
import { getMatchHistory } from "../services/userApi";
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

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
	
	if (!user) return <div>Loading...</div>;

	const totalMatches = user.wins + user.losses;
	const winRate = totalMatches ? (user.wins / totalMatches) * 100 : 0;

  const donutData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: [user.wins, user.losses],
        backgroundColor: ['#16a34a', '#dc2626'],
        hoverBackgroundColor: ['#15803d', '#b91c1c'],
        borderColor: '#000000',
        borderWidth: 2,
      },
    ],
  };
  
  const barData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        label: 'Matches',
        data: [user.wins, user.losses],
        backgroundColor: ['#16a34a', '#dc2626'],
        hoverBackgroundColor: ['#15803d', '#b91c1c'],
        borderColor: '#000000',
        borderRadius: 8,
        borderWidth: 2,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          display: false,
          color: '#ccc',
          font: {
            size: 14,
          },
        },
      },
    },
  };

  const barOptions: ChartOptions<'bar'> = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#ccc',
          stepSize: 1,
        },
        grid: {
          color: '#333',
        },
      },
      x: {
        ticks: {
          color: '#ccc',
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  	return (
      <>
      <UserHeader />
      <Background />
          <div className="flex gap-2 mt-10 mx-15">
            
            <div className="w-2/5 border-2 border-black rounded-lg bg-[#2a2a2a] p-4">
              <h2 className="text-2xl font-semibold text-white mb-2">Match History</h2>
                <ul className="space-y-3 w-full max-h-[850px] overflow-y-auto pr-2">
                  {matchHistory.map((match) => {
                    const loggedInUserId = Number(sessionStorage.getItem('activeUserId'));
                    const isWin = match.winner_id === loggedInUserId;
                    const opponentId = match.opponent_id;
                    const opponentName = opponentNames[opponentId] || `User #${opponentId}`;
                    const formattedDate = new Date(match.date).toLocaleDateString();

                    return (
                      <li
                        key={match.id}
                        className={`p-3 sm:p-4 border border-black rounded-md shadow-lg ${
                          isWin ? 'bg-green-600' : 'bg-red-600'
                        }`}
                      >
                        <div className="flex flex-wrap justify-between items-center mb-1 gap-1">
                          <span className="text-xl font-semibold text-white truncate max-w-[60%]">vs. {opponentName}</span>
                          <span className="text-lg font-bold text-white truncate">{isWin ? 'Win' : 'Loss'}</span>
                        </div>

                        <div className="flex flex-wrap justify-between text-sm font-medium text-gray-100 mb-1">
                          <span>Your Score: <span className="font-bold">{match.user_score}</span></span>
                          <span>Opponent Score: <span className="font-bold">{match.opponent_score}</span></span>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-300 gap-1">
                          <span>{formattedDate}</span>
                          <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full text-xs font-semibold">
                            {match.match_type}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
            </div>

            <div className="w-3/5 bg-[#2a2a2a] rounded-lg p-8 border-2 border-black shadow-md flex flex-col items-center justify-start">
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-semibold text-white mb-4">Overall Stats</h2>
                <div className="flex justify-center text-gray-200 text-lg">
                  <p className="font-medium">
                    W/L rate: {winRate.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="w-full md:w-[48%] p-4 border-2 border-black rounded-xl shadow-md h-72">
                  <Doughnut data={donutData} options={donutOptions} />
                </div>

                <div className="w-full md:w-[48%] p-4 border-2 border-black rounded-xl shadow-md h-72 bg-[#2a2a2a]">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>

          </div>
      </>
  );
};

export default ProfilePage;