import { AUTHSERV } from '../config/env-config.js';

interface AuthFetchOptions {
	method: string;
	body?: string | FormData;
	headers: {
		'Content-Type'?: string;
		'Authorization': string;
	};
}

interface AuthFetchResponse {
	status: number;
	error?: string;
	newToken?: string;
	users?: User[];
	request_count?: number;
	userData?: User[]
	tourData?: Tournament;
	tournaments?: Tournament[];
	matchHistory?: MatchHistory[];
	avatarPath?: string;
	message?: string;
}

export interface User {
	name: string;
	email?: string;
	online_status?: number;
	wins?: number;
	losses?: number;
	avatar?: string;
	id: number;
}

export interface Tournament {
	id?: string;
	name?: string;
	playerAmount?: number;
	size?: number;
	created_by?: number;
	created_at?: string;
	status?: string;
	error?: string;
	message?: string;
}

const API_AUTH_URL = AUTHSERV;

export interface MatchHistory {
	id: number;
	user_id: number;
	opponent_id: number;
	user_score: number;
	opponent_score: number;
	winner_id: number;
	round: string;
	tournament_id: number;
	match_type: string;
	date: string;
}


export async function authFetch(url: string, options: AuthFetchOptions): Promise<AuthFetchResponse> {

	const response = await fetch(url, options);

	if (response.status === 204) {
		return {
			status: response.status,
		};
	}
	
	const responseData = await response.json();

	if (response.status === 401) {
		return {
			status: response.status,
			error: responseData.error || 'Unauthorized'
		}
	}

	if (response.status === 403) {

		const userId = sessionStorage.getItem('activeUserId');
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
		const refreshToken = sessionData.refreshToken

		const response = await fetch(`${API_AUTH_URL}/api/token`, {
			method: 'POST',
			body: JSON.stringify({id: Number(userId), token: sessionData.refreshToken}),
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer`
			}
		});
		
		const newResponse = await response.json();

		if (response.ok) {
			sessionStorage.removeItem(userId);
			sessionStorage.setItem('activeUserId', userId.toString());
			sessionStorage.setItem(userId.toString(), JSON.stringify({...sessionData, accessToken: newResponse.accessToken, refreshToken: refreshToken}));

			return {
				status: 1,
				error: 'accessToken refreshed',
				newToken: newResponse.accessToken
			}
		}

		if (!response.status) {
			return {
				status: response.status,
				error: newResponse.error
			}
		}
	}
	return {
		status: response.status,
		error: responseData.error,
		users: responseData,
		request_count: responseData.request_count,
		userData: responseData.data,
		tourData: responseData.tournament,
		tournaments: responseData.Tournament,
		matchHistory: responseData,
		avatarPath: responseData.avatar,
		message: responseData.message
	};
}
