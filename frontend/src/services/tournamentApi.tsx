import { authFetch, Tournament } from "./api";

export async function getPlayerAmount(tourId: number) : Promise<number> {	
	try {
		const response = await fetch('/api/tournament/' + tourId + '/playerAmount', {
			method: 'GET',
		});

		const responseData = await response.json();

		return responseData.playerAmount;
	} catch (error) {
		console.error("getPlayerAmount error:", error);
	}
}

export async function createTournament(tournament: Tournament) {
	
	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

	try {
			const options = {
				method: 'POST',
				body: JSON.stringify({name: tournament.name, size: tournament.size}),
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
			return ({status: retryResponse.status});
		}
		return ({status: response.status, error: response.error});

	} catch (error) {
		console.error("createrTour error:", error);
	}
}

export async function joinTournament(tourId: number): Promise<number> {
	
	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	
	try {
			const options = {
				method: 'POST',
				body: JSON.stringify({}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionData.accessToken}`
				}
			}

		const response = await authFetch('/api/tournament/' + tourId + '/join', options);

		if (response.status === 1) {
			const retryResponse = await fetch('/api/tournament/' + tourId + '/join', {
				method: 'POST',
				body: JSON.stringify({}),
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
	}
}

export async function leaveTournament(tourId : number): Promise<number> {
	
	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

	try {
			const options = {
				method: 'DELETE',
				body: JSON.stringify({}),
				headers: {
				'Content-Type' : 'application/json',
				'Authorization' : `Bearer ${sessionData.accessToken}`
				}
			}

		const response = await authFetch('/api/tournament/' + tourId + '/leave', options);

		if (response.status === 1) {
			const retryResponse = await fetch('/api/tournament/' + tourId + '/leave', {
				method: 'DELETE',
				body: JSON.stringify({}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});
			return (retryResponse.status)
		}
		return (response.status)
	
	} catch (error) {
		console.error("leaveTour:", error);
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
	id?: string;
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

			return {
				status: retryResponse.status,
				id: responseData?.tournament?.id
			};
		}

		return {
			status: response.status,
			id: response.tourData?.id
		};

	} catch (error) {
		console.error("leaveButton error:", error);
		return {
			status: 500,
		};
	}
}
