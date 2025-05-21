import UserHeader from "../components/userHeader";
import { Link } from 'react-router-dom';
import React from 'react';
import { useState, useRef } from "react";
import { useToast } from "../components/toastBar/toastContext";
import {
	getPlayerAmount,
	createrTour,
	joinTour,
	getTournaments,
	leaveTour,
	// fetchLeaveButton
 } from "../services/tournamentApi";


export interface tournament {
	name : string;
	size : number;
}

const TournamentsPage: React.FC = () => {
	const [showForm, setShowForm] = useState(false);
	const [showList, setShowList] = useState(false);
	const [myTour, setMyTour] = useState(null);
	const [fetchedTournaments, setFetchedTournaments] = useState<any[]>([]);
	const tourName = useRef<HTMLInputElement>(null);
	const tourSize = useRef<HTMLInputElement>(null);
	const toast = useToast();

	const fetchLeaveButton = async () => {

		const userId = sessionStorage.getItem('activeUserId');
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

		const response = await fetch('/api/tournament/participant/tourPage', {
			method: 'GET',
			headers: {
			'Authorization': `Bearer ${sessionData.accessToken}`
			}
		});

		if (response.ok)
		{
			const data = await response.json();
			setMyTour(data.tournament.id);
		}
		else
			setMyTour(-1);
	}

	const fetchTournaments = async () => {
		try {
		  await fetchLeaveButton();
		  const data = await getTournaments();

		  if (Array.isArray(data)) {
			setFetchedTournaments(data);
		  } else {
			console.error("Unexpected data format:", data);
		  }
		} catch (error) {
		  console.error("Failed to fetch tournaments", error);
		}
	};

	const createTour = () => {
		const name = tourName.current.value.trim() || tourName.current.placeholder;
		const size = tourSize.current.value.trim() || tourSize.current.placeholder;

		createrTour({name: name, size: Number(size)}).then((response) => {
			if (response == 200) {
				console.log("Tournament created");
			} else {
				toast.open("Tournament creation failed", "error");
			}
		}
		);
		setShowForm(false);
	}

	return (
		<>
		<UserHeader />

		<Link 
					to="/tour-game"
					className="w-64 bg-blue-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
			  	>
					Go To Game page
		</Link>

		<button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        Test Create Tournament
      </button>

	  <button
          onClick={() => {
			setShowList(true);
			fetchTournaments();
		  }}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        Tournament list
      </button>

		{showForm && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <p className="text-center text-gray-600 mb-4">Tournament name</p>
            <input
              id="tour-name"
              type="text"
              placeholder="Tournament name..."
			  ref={tourName}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            />
            <p className="text-center text-gray-600 mb-4">Tournament size</p>
            <input
              id="tour-size"
              type="text"
              placeholder="4"
			  ref={tourSize}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            />
			<button
			onClick={createTour}
			className="w-full bg-green-500 text-white p-2 rounded"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="w-full bg-red-500 text-white p-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

		{showList && (
		<div className="absolute inset-0 bg-black/60 flex items-center justify-center z-60">
			<div className="bg-white p-6 rounded-lg shadow-lg w-[480px] max-h-[80vh] flex flex-col">
			<p className="text-center text-gray-600 mb-4">Tournaments</p>

			<div className="overflow-y-auto space-y-4 pr-2 flex-grow">
				{fetchedTournaments.map((tour) => (
				<div
					key={tour.id}
					className="flex items-center justify-between border p-3 rounded"
				>
					<div className="flex items-center gap-5">
					<img
					src="/trophy.png"
					alt="icon"
					className="w-12 h-12 mt-1"
					/>	
					<div className="flex flex-col">
					<p className="font-medium">{tour.name}</p>
					<p className="text-sm text-gray-500">{tour.playerAmount + "/" + tour.size}</p>
					</div>
					</div>
					{String(tour.id) !== String(myTour) ? (
					<button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
					onClick={() => {
						joinTour(tour.id).then((response) => {
							if (response != 200) {
								toast.open("You are already in a tournament", "error" );
							}
						});
						getPlayerAmount(tour.id).then((newAmount) => {
						  setFetchedTournaments((prevTournaments) =>
							prevTournaments.map((t) =>
							  t.id === tour.id ? { ...t, playerAmount: newAmount } : t));
						});
						fetchLeaveButton();
					}}
					>
					Join
					</button>) : String(tour.id) === String(myTour) ? (

					<button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
					onClick={() => {
						leaveTour(tour.id).then((response) => {
							if (response != 200) {
								toast.open("YOU ARE NOT IN THIS TOURNAMENT!!", "error" );
							}
						});						
						getPlayerAmount(tour.id).then((newAmount) => {
							setFetchedTournaments((prevTournaments) =>
							  prevTournaments.map((t) =>
								t.id === tour.id ? { ...t, playerAmount: newAmount } : t));
						  });
						fetchLeaveButton();
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
				className="mt-4 w-full bg-red-500 text-white p-2 rounded"
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