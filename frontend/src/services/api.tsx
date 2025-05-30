// import { tournament } from "../services/tournamentApi"

interface AuthFetchOptions {
	method: string;
	body?: string;
	headers: {
		'Content-Type': string;
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

const API_AUTH_URL = 'http://localhost:4000'; //add to .env

export async function authFetch(url: string, options: AuthFetchOptions): Promise<AuthFetchResponse> {

	console.log("in authfetch before fetch", url, options);
	const response = await fetch(url, options);
	console.log("in authfetch after fetch", response);

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

		console.log("403, getting new token");

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
		
		console.log("hello after fetch ",response);
		const newResponse = await response.json();
		console.log("with new accessToken ",newResponse);

		if (response.ok) {
			console.log("ok response");
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
		tournaments: responseData.Tournament
	};
}
//limit the friends list size in the back to not fetch that many to the front. 
//log out the user when accesstoken expires to have a failsafe

interface UploadImageRequest {
	accToken: string;
	file: File;
}

interface UploadImageResponse {
	status: number;
	error?: string;
}

export async function uploadAvatar(uploadData: UploadImageRequest): Promise<UploadImageResponse> {
	try {
		const formData = new FormData();
		formData.append('image', uploadData.file);

		const response = await fetch('/api/upload', {
			method: 'PUT',
			body: formData,
			headers: {
				'Authorization': `Bearer ${uploadData.accToken}`
			}
		});

		const responseData = await response.json();

		if (responseData.status === 1 && responseData.newToken) {
			const retryFormData = new FormData();
			retryFormData.append('image', uploadData.file);

			const retryResponse = await fetch('/api/upload', {
				method: 'PUT',
				body: retryFormData,
				headers: {
					'Authorization': `Bearer ${responseData.newToken}`
				}
			});

			const retryData = await retryResponse.json();

			if (!retryResponse.ok) {
				return {
					status: retryResponse.status,
					error: retryData.error || 'Image upload failed'
				};
			}

			return {
				status: retryResponse.status,
				error: retryData.error || 'Image upload successful',
			};
		}

		if (!response.ok) {
			return {
				status: response.status,
				error: responseData.error || 'Image upload failed'
			};
		}

		return {
			status: response.status,
			error: responseData.error || 'Image upload successful',
		};

	} catch (error) {
		console.error("Upload image error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface UpdateUserRequest {
  accToken: string;
  name: string;
  email: string;
  number: string;
  password: string;
}

export interface UpdateUserResponse {
  status: number;
  error?: string;
}

export async function updateUser(userData: UpdateUserRequest, id: string): Promise<UpdateUserResponse> {
	try {
		const requestBody = JSON.stringify({
			name: userData.name,
			email: userData.email,
			number: userData.number,
			password: userData.password,
		});

		console.log(userData.name, userData.email, userData.number, userData.password);
		const response = await fetch(`/api/user/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${userData.accToken}`
			},
			body: requestBody
		});

		const responseData = await response.json();

		if (responseData.status === 1 && responseData.newToken) {
			const retryResponse = await fetch(`/api/user/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${responseData.newToken}`
				},
				body: requestBody
			});

			const retryData = await retryResponse.json();

			return {
				status: retryResponse.status,
				error: retryData.error || 'Update successful'
			};
		}

		if (!response.ok) {
			return {
				status: response.status,
				error: responseData.error || 'Update failed',
			};
		}

		return {
			status: response.status,
			error: responseData.error || 'Update successful',
		};

	} catch (error) {
		console.error("Update user:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.',
		};
	}
}

export async function updatePassword(userData: UpdateUserRequest, id: string): Promise<UpdateUserResponse> {
	try {
		const requestBody = JSON.stringify({
			password: userData.password,
		});

		const response = await fetch(`/api/user/pwd/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${userData.accToken}`
			},
			body: requestBody
		});

		const responseData = await response.json();

		if (responseData.status === 1 && responseData.newToken) {
			const retryResponse = await fetch(`/api/user/pwd/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${responseData.newToken}`
				},
				body: requestBody
			});

			const retryData = await retryResponse.json();

			return {
				status: retryResponse.status,
				error: retryData.error || 'Update successful'
			};
		}

		if (!response.ok) {
			return {
				status: response.status,
				error: responseData.error || 'Update failed',
			};
		}

		return {
			status: response.status,
			error: responseData.error || 'Update successful',
		};

	} catch (error) {
		console.error("Update user:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.',
		};
	}
}

export async function getUser(id: string): Promise<User> {

	try {
		const response = await fetch(`/api/user/${id}`, {
			method: 'GET',
			headers: {
			'Content-Type': 'application/json',
			}
		});

		const responseData = await response.json();

		if (!response.ok)
			return { name: '',
				online_status: 0,
				wins: 0,
				losses: 0,
				avatar: '',
				email: '',
				id: 0
		}
		return { name: responseData.name,
			online_status: responseData.status,
			wins: responseData.wins,
			losses: responseData.losses,
			avatar: responseData.avatar,
			email: responseData.email,
			id: responseData.id
		}
		
	} catch (error) {
		error.console.log();
		console.error("Login error:", error);
		return { name: '',
			online_status: 0,
			wins: 0,
			losses: 0,
			avatar: '',
			email: '',
			id: 0
		};
	}
}
