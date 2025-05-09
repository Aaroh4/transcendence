import UserHeader from "../components/headers";
import { createNewGame, frontEndGame, cleanGame } from "../game/frontEndGame";
import { useEffect, useRef, useState } from "react";
import { createSocket, getSocket, closeSocket } from "../utils/socket";
import Background from '../components/background.js';

export default function GameRoom({matchType}) {
	const hasRun1 = useRef(false);
	const hasRun2 = useRef(false);
	const leftPage = useRef(false);
	const [tournamentStatus, setTournamentStatus] = useState(null);
	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

useEffect(() => {
	if (!hasRun1.current && matchType === "tournament") {
		fetch('/api/tournament/1', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionData.accessToken}`
			}
		})
		.then((res) => {
			if (res.status === 204) {
				setTournamentStatus("active");
			} else {
				setTournamentStatus("no-tournament");
			}
		})
		.catch((err) => {
			console.error("Failed to fetch tournament:", err);
			setTournamentStatus("error");
		});
	} else if (matchType !== "tournament") {
		setTournamentStatus("normal");
	}

	hasRun1.current = true;
	return () => {
		if (frontEndGame && leftPage.current) {
			closeSocket();
			cleanGame();
		} else {
			leftPage.current = true;
		}
	};
}, []);

useEffect(() => {
	if (hasRun2.current) return;
	const isTournamentReady = tournamentStatus === "active" || tournamentStatus === "normal";

	if (isTournamentReady) {
		if (matchType !== "solo") {
			createSocket();
		}

		createNewGame(matchType, getSocket(), userId);
		hasRun2.current = true;
	}
}, [tournamentStatus]);


const matchTypeButtons = () => {
	switch (matchType) {
		case "solo":
			return(
				<>
					<p id="size-txt" className="text-center text-gray-600 mb-4">Lobby size: 1/1</p>
					<h1 className="text-2xl font-bold text-center mb-4">Welcome to the Solo Game!</h1>
					<button id="ready-solo" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
						Start!
					</button>
					</>
				);
				case "tournament":
					if (tournamentStatus != "active")
						{
							return (<p>No Tournament Active!</p>);
						}	
						else
						{
							return(
							<>
							<p id="size-txt" className="text-center text-gray-600 mb-4">Lobby size: 0/2</p>
							<h1 className="text-2xl font-bold text-center mb-4">Welcome to the Tournament!</h1>
							<button id="ready-tour" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
								Ready up!
							</button>
							</>
						);
				}
			
			case "normal":
				return(
					<>
					<p id="size-txt" className="text-center text-gray-600 mb-4">Lobby size: 0/2</p>
					<h1 className="text-2xl font-bold text-center mb-4">Welcome to the Gameroom!</h1>
					<button id="ready-match" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
						Start Matchmaking!
					</button>
					</>
				);
			default:
			return (<p>FUCK OFF</p>);
		}
	};

	return (
		<>
			<Background />
			<UserHeader />
			<div id="gameroom-page" className="bg-green-100 p-8 rounded-lg shadow-md w-[820px]">				
			{matchTypeButtons()}

				<label htmlFor="colorSelect">Choose ball color:</label>
				<select id="colorSelect" name="mySelect" defaultValue="white">
					<option value="white" >White</option>
					<option value="green">Green</option>
					<option value="blue">Blue</option>
					<option value="red">Red</option>
					<option value="purple">Purple</option>
				</select>

				<button id="start-btn" hidden className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
					Start The Game
				</button>

				<details id="edit-game" hidden>
					<summary className="cursor-pointer bg-blue-500 text-fuchsia-800 p-2 rounded">
						Open Input Fields
					</summary>
					<p className="text-center text-gray-600 mb-4">Ball size</p>
					<input id="ball-size" type="text" placeholder="20" className="block w-full p-2 border border-gray-300 rounded mt-2"/>
					<p className="text-center text-gray-600 mb-4">Ball speed</p>
					<input id="ball-speed" type="text" placeholder="3" className="block w-full p-2 border border-gray-300 rounded mt-2"/>
				</details>
			</div>

			<div id="game-container" className="bg-green-100 p-2 rounded-lg shadow-md mt-4 w-[820px] h-[620px]"></div>

			{/*<div id="chat-container" className="bg-green-900 p-2 rounded-lg shadow-md mt-4 w-[400px] h-[620px] fixed top-4 right-4">
				<input id="chat-box" type="text" placeholder="" className="block w-full p-2 border border-gray-300 rounded mt-2" maxLength="50"/>
				<button id="send-btn"className="w-full bg-purple-500 text-white text-center py-2 rounded-md hover:bg-green-600">
					Send
				</button>
			</div>*/}
		</>
	);
}