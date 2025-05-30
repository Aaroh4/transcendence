import { Link, useNavigate } from "react-router-dom";
import { DeleteUserRequest, deleteUser } from "../services/userApi";
import { useToast } from "../components/toastBar/toastContext";
import UserHeader from "../components/userHeader";
import Background from "../components/background";
import { getUser, User } from "../services/api";
import { useEffect, useState } from 'react';
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
          <div className="flex gap-2 mt-10 mx-10">
            
            <div className="w-2/5 border-2 border-black rounded-lg bg-[#2a2a2a] p-4">
              <h2 className="text-2xl font-semibold text-white mb-2">Match History</h2>
              <ul className="space-y-3 w-full max-h-[900px] overflow-y-auto pr-2">
                {mockMatches.map((match) => (
                  <div key={match.id}
                    className={`p-2 border border-black rounded-md shadow-lg ${
                      match.result === 'Win' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    >
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-medium">{match.opponent}</span>
                      <span className="text-lg font-bold">{match.result}</span>
                    </div>
                    <div className="text-sm text-gray-300">{match.date}</div>
                  </div>
                  ))}
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
                <div className="flex-1 p-4 border-2 border-black rounded-xl shadow-md h-120">
                  <Doughnut data={donutData} options={donutOptions} />
                </div>

                <div className="flex-1 p-4 border-2 border-black rounded-xl shadow-md h-120 bg-[#2a2a2a]">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>

          </div>
      </>
  );
};

export default ProfilePage;
