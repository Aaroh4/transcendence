import { authFetch } from "./api";

export interface tournament {
	name: string;
	size: number;
}

export async function getPlayerAmount(tourId: number) : Promise<number> {	
	try {
		const response = await fetch('/api/tournament/' + tourId + '/playerAmount', {
			method: 'GET',
		});

		const responseData = await response.json();

		return responseData.playerAmount;
	} catch (error) {
		console.error("getPlayerAmount error:", error);
		return (500);
	}
}

export async function createrTour(tournament: tournament): Promise<number> {
	
	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

	try {
			const options = {
				method: 'POST',
				body: JSON.stringify(tournament),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionData.accessToken}`
				}
			}
		
		const response = await authFetch('/api/tournament/create', options);

		if (response.status === 1) {
			const retryResponse = await fetch('/api/tournament/create', {
				method: 'POST',
				body: JSON.stringify(tournament),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});
			return (retryResponse.status)
		}
		return response.status;

	} catch (error) {
		console.error("createrTour error:", error);
		return (500);
	}
}

export async function joinTour(tourId: number): Promise<number> {
	
	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	
	try {
			const options = {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionData.accessToken}`
				}
			}

		const response = await authFetch('/api/tournament/' + tourId + '/join', options);

		if (response.status === 1) {
			const retryResponse = await fetch('/api/tournament/' + tourId + '/join', {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});
			return (retryResponse.status)
		}
		return (response.status)

	} catch (error) {
		console.error("joinTour error:", error);
		return (500);
	}
}

export async function getTournaments() {

	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

	try {
		const response = await fetch('/api/tournaments', {
			method: 'GET',
			headers: {
			'Authorization': `Bearer ${sessionData.accessToken}`
			}
		});

		const responseData = await response.json();

		return responseData;

	} catch (error) {
		console.error("getTournament error:", error);
	}
}

export interface leaveButtonResponse {
	status: number;
	data: any;
}

export async function fetchLeaveButton(): Promise<leaveButtonResponse>{
	
	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

	try {
			const options = {
				method: 'GET',
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionData.accessToken}`
				}
			}

			const response = await authFetch('/api/tournament/participant/tourPage', options);

			if (response.status === 1) {
				const retryResponse = await fetch('/api/tournament/participant/tourPage', {
					method: 'GET',
					headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${response.newToken}`
					}
				});

				const responseData = await retryResponse.json();
				
				return (responseData.tournament.id);
			}

			return ({status: 0, data: response});



	} catch (error) {
		console.error("leaveButton error:", error);
	}

// 		const response = await fetch('/api/tournament/participant/tourPage', {
// 			method: 'GET',
// 			headers: {
// 			'Authorization': `Bearer ${sessionData.accessToken}`
// 			}
// 		});
}


// this from the tournament page

	// const fetchTournaments = async () => {
	// 	try {
	// 	  const myTour = await fetchLeaveButton();

	// 	console.log(myTour)
	// 	  if (myTour.status === 200)
	// 		{
	// 			setMyTour(myTour.data);
	// 		}
	// 		else
	// 			setMyTour(-1);
	// 	  const data = await getTournaments();

	// 	  if (Array.isArray(data)) {
	// 		setFetchedTournaments(data);
	// 	  } else {
	// 		console.error("Unexpected data format:", data);
	// 	  }
	// 	} catch (error) {
	// 	  console.error("Failed to fetch tournaments", error);
	// 	}
	// };
