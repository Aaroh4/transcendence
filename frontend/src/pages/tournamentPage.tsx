import UserHeader from "../components/userHeader";
import { Link } from 'react-router-dom';
import React from 'react';
import { useState, useRef } from "react";
import { useToast } from "../components/toastBar/toastContext";
import {
	getPlayerAmount,
	createTournament,
	joinTournament,
	getTournaments,
	leaveTournament,
	fetchLeaveButton
 } from "../services/tournamentApi";
import { Tournament } from "../services/api";
import Background from "../components/background";

const TournamentsPage: React.FC = () => {
	const [showForm, setShowForm] = useState(false);
	const [showList, setShowList] = useState(false);
	const [myTour, setMyTour] = useState(null);
	const [fetchedTournaments, setFetchedTournaments] = useState<any[]>([]);
	const tourName = useRef<HTMLInputElement>(null);
	const tourSize = useRef<HTMLInputElement>(null);
	const toast = useToast();

	const handleFetchLeaveButton = async () => {

		const response = await fetchLeaveButton();

		if (response.status === 200)
		{
			setMyTour(response.id);
		}
		else
			setMyTour(-1);
	}

	const fetchTournaments = async () => {
		try {
			const data = await getTournaments();
			
			if (Array.isArray(data) && data.length > 0) {
				setFetchedTournaments(data);
				await handleFetchLeaveButton();
			}
		} catch (error) {
		  console.error("Failed to fetch tournaments", error);
		}
	};

	const handleCreateTour = () => {
		const name = tourName.current.value.trim() || tourName.current.placeholder;
		const size = tourSize.current.value.trim() || tourSize.current.placeholder;

		const settings: Tournament = {
			name: name,
			size: Number(size)
		}
		createTournament(settings).then((response) => {
			if (response.status == 200) {
				console.log("Tournament created");
			} else {
				toast.open(response.error, "error");
			}
		}
		);
		setShowForm(false);
	}

	return (
		<>
		<UserHeader />
		<Background />
		<div className="flex flex-col items-center justify-center gap-6 pt-[30vh] px-[1vw] pb-[30vh]">
		<div className="flex flex-wrap gap-6 justify-center">
			<button
				onClick={() => setShowForm(true)}
				className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
				<img src="../createTournament.png" alt="Game Icon" className="w-auto h-2/4 mb-2" />
				<span className="text-xl font-bold mt-2">Create<br/>Tournament</span>
			</button>

			<button
				onClick={() => {
				setShowList(true);
				fetchTournaments();
				}}
				className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
				<img src="../listTournament.png" alt="Game Icon" className="w-auto h-2/4 mb-2" />
				<span className="text-xl font-bold mt-2">Tournament<br/>list</span>
			</button>

			<Link 
				to="/tour-game"
				className="w-44 h-44 bg-black text-white rounded-md hover:bg-green-700 flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
				>
				<img src="../tournamentbracket.png" alt="Game Icon" className="w-auto h-3/5 mt-1" />
				<span className="text-xl font-bold">Tournament<br/>Room</span>
			</Link>
		</div>
		</div>
	
		{showForm && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border-2 border-green-500 p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto flex flex-col">
		  <h1 className="text-2xl text-white font-bold text-center mb-4">Create Tournament</h1>
            <p className="text-center text-gray-100 mb-1">Tournament name</p>
            <input
              id="tour-name"
              type="text"
              placeholder="Tournament name..."
			  ref={tourName}
              className="block w-full p-2 border-2 border-black bg-[#2a2a2a] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
            />
            <p className="text-center text-gray-100 mb-1">Tournament size</p>
            <input
              id="tour-size"
              type="text"
              placeholder="4"
			  ref={tourSize}
              className="block w-full p-2 border-2 border-black bg-[#2a2a2a] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
            />
			<button
			onClick={handleCreateTour}
			className="border-2 border-black w-full mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 self-end transform transition-transform hover:scale-102 duration-100"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border-2 border-black w-full mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 self-end transform transition-transform hover:scale-102 duration-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

		{showList && (
		<div className="absolute inset-0 bg-black/60 flex items-center justify-center z-60">
			<div className="bg-[#1a1a1a] border-2 border-green-500 p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto flex flex-col">
			<h1 className="text-2xl text-white font-bold text-center mb-4">Tournaments</h1>

			<div className="overflow-y-auto space-y-4 pr-2 flex-grow">
				{fetchedTournaments.map((tour) => (
				<div
					key={tour.id}
					className="border rounded flex items-center justify-between p-2 mb-2 hover:bg-[#2a2a2a]"
				>
					<div className="flex items-center gap-5">
						<img
						src="/tourTrophy.png"
						alt="icon"
						className="w-12 h-12 mt-1 rounded-md"
						/>	
						<div className="flex flex-col">
							<p className="font-medium text-white">{tour.name}</p>
							<p className="text-sm text-gray-300">{tour.playerAmount + "/" + tour.size}</p>
						</div>
					</div>
					{String(tour.id) !== String(myTour) ? (
					<button className="bg-green-600 border-2 border-black text-white px-3 py-1 rounded hover:bg-green-700 transform transition-transform hover:scale-104 duration-100"
					onClick={() => {
						joinTournament(tour.id).then((response) => {
							if (response != 200) {
								toast.open("You are already in a tournament", "error" );
							}
						});
						getPlayerAmount(tour.id).then((newAmount) => {
						  setFetchedTournaments((prevTournaments) =>
							prevTournaments.map((t) =>
							  t.id === tour.id ? { ...t, playerAmount: newAmount } : t));
						});
						handleFetchLeaveButton();
					}}
					>
					Join
					</button>) : String(tour.id) === String(myTour) ? (

					<button className="bg-red-600 border-2 border-black text-white px-3 py-1 rounded hover:bg-red-700 transform transition-transform hover:scale-104 duration-100"
					onClick={() => {
						leaveTournament(tour.id).then((response) => {
							if (response != 200) {
								toast.open("YOU ARE NOT IN THIS TOURNAMENT!!", "error" );
							}
						});						
						getPlayerAmount(tour.id).then((newAmount) => {
							setFetchedTournaments((prevTournaments) =>
							  prevTournaments.map((t) =>
								t.id === tour.id ? { ...t, playerAmount: newAmount } : t));
						  });
						handleFetchLeaveButton();
					}}
					>
						Leave
					</button>
					) : null}
				</div>
				))}
			</div>

			<button
				onClick={() => {
					setShowList(false);
					setFetchedTournaments([]);
				}}
				className="border-2 border-black w-full mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 self-end transform transition-transform hover:scale-102 duration-100"
			>
				Close
			</button>
			</div>
		</div>
		)}

	</>
	);
};

export default TournamentsPage;