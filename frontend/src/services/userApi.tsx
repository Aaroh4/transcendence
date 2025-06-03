import { AUTHSERV } from '../config/env-config.js';
import { User, MatchHistory, authFetch } from "./api";

export interface RegistrationRequest {
	name: string;
	email: string;
	password: string;
	captchaToken: string;
}

export interface RegistrationResponse {
	userId: number;
	email: string;
	avatarPath: string;
	status: number;
	error: string;
}

export async function registerUser(userData: RegistrationRequest): Promise<RegistrationResponse> {
	
	try {
		const response = await fetch('/api/user', {
			method: 'POST',
			body: JSON.stringify(userData),
			headers: {
			'Content-Type': 'application/json',
			}
		});

		const responseData = await response.json();

		if (!response.ok)
			return { userId: 0,
				email: '',
				avatarPath: '',
				status: response.status,
				error: responseData.error
		}
		return { userId: responseData.userId,
			email: responseData.email,
			avatarPath: responseData.avatarPath,
			status: response.status,
			error: 'Registration successfull'
		}
		
	} catch (error) {
		console.error("Login error:", error);
		return {
			userId: 0,
			email: '',
			avatarPath: '',
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface LoginRequest {
	email: string;
	password: string;
	captchaToken: string;
}

export interface LoginResponse {
	userId: number;
	name: string;
	avatar: string;
	accessToken: string;
	refreshToken: string;
	status: number;
	error: string;
}

const API_AUTH_URL = AUTHSERV;

export async function loginUser(userData: LoginRequest, captchaToken): Promise<LoginResponse> {
	console.log("P: " + API_AUTH_URL);
	try {
		const response = await fetch(`${API_AUTH_URL}/api/login`, {
			method: 'POST',
			body: JSON.stringify({ ...userData, captchaToken}),
			headers: {
			'Content-Type': 'application/json',
			}
		});

		const responseData = await response.json();

		if (!response.ok)
			return { userId: 0,
				name: '',
				avatar: '',
				accessToken: '',
				refreshToken: '',
				status: response.status,
				error: responseData.error || 'Login failed'
			}
		return {
			userId: responseData.userId,
			name: responseData.name,
			avatar: responseData.avatar,
			accessToken: responseData.accessToken,
			refreshToken: responseData.refreshToken,
			status: response.status,
			error: responseData.error || 'Login successful'
		};

	} catch (error) {
		console.error("Login error:", error);
		return {
			userId: 0,
			name: '',
			avatar: '',
			accessToken: '',
			refreshToken: '',
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface LogoutRequest {
	token: string;
	accToken: string;
}

interface LogoutResponse {
	status: number;
	error: string;
}

export async function logoutUser(userData: LogoutRequest): Promise<LogoutResponse> {

	try {
			const options = {
				method: 'DELETE',
				body: JSON.stringify({token: userData.token}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${userData.accToken}`
				}
			}

		const response = await authFetch(`${API_AUTH_URL}/api/logout`, options);

		if (response.status === 1) {
			const retryResponse = await fetch(`${API_AUTH_URL}/api/logout`, {
				method: 'DELETE',
				body: JSON.stringify({token: userData.token}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});

			const responseData = await retryResponse.json();
			console.log(retryResponse);
			
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'Logout failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'Logout successful'
			};
		}

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Logout failed'
		}
		return {
			status: response.status,
			error: response.error || 'Logout successful'
		};

	} catch (error) {
		console.error("Logout user:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface DeleteUserRequest {
	id: number;
	accToken: string;
}

interface DeleteUserResponse {
	status: number;
	error: string;
}

export async function deleteUser(userData: DeleteUserRequest): Promise<DeleteUserResponse> {

	try {
			const options = {
				method: 'DELETE',
				body: JSON.stringify({id: userData.id}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${userData.accToken}`
				}
			}

		const response = await authFetch(`/api/user/delete` , options);

		if (response.status === 1) {
			console.log(userData.accToken);//delete
			const retryResponse = await fetch(`/api/user/delete`, {
				method: 'DELETE',
				body: JSON.stringify({id: userData.id}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});
			
			
			const responseData = await retryResponse.json();
			console.log(retryResponse);
			
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'User delete failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'User delete successful'
			};
		}

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'User delete failed'
		}
		return {
			status: response.status,
			error: response.error || 'User delete successful'
		};

	} catch (error) {
		console.error("Delete user:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

interface UploadImageRequest {
	accToken: string;
	file: File;
}

interface UploadImageResponse {
	status: number;
	avatar?: string;
	error?: string;
}

export async function uploadAvatar(uploadData: UploadImageRequest): Promise<UploadImageResponse> {

	try {
			const formData = new FormData();
			formData.append('avatar', uploadData.file);

			const options = {
				method: 'PUT',
				body: formData,
				headers: {
					'Authorization': `Bearer ${uploadData.accToken}`
				}
			}

		const response = await authFetch('/api/upload', options)

		if (response.status === 1) {
			const retryResponse = await fetch('/api/upload', {
				method: 'PUT',
				body: formData,
				headers: {
					'Authorization': `Bearer ${response.newToken}`
				}
			});

			const responseData = await retryResponse.json();
			console.log(retryResponse);
		
			if (!retryResponse.ok) {
				return {
					status: retryResponse.status,
					error: responseData.error || 'Avatar upload failed'
				};
			}
			return {
				status: retryResponse.status,
				avatar: responseData.avatar,
				error: responseData.error || 'Avatar upload successful',
			};
		}

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Avatar upload failed'
		}
		return {
			status: response.status,
			avatar: response.avatarPath,
			error: response.error || 'Avatar upload successful'
		};

	} catch (error) {
		console.error("Avatar upload:", error);
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
}

export interface UpdateUserResponse {
  status: number;
  error?: string;
}

export async function updateUser(userData: UpdateUserRequest, id: string): Promise<UpdateUserResponse> {
	console.log(userData.name, userData.email);
	try {
			const options = {
			method: 'PUT',
			body: JSON.stringify({name: userData.name, email: userData.email}),
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${userData.accToken}`
			}
		}

		const response = await authFetch(`/api/user/${id}`, options);

		if (response.status === 1) {
			const retryResponse = await fetch(`/api/user/${id}`, {
				method: 'PUT',
				body: JSON.stringify({name: userData.name, email: userData.email}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			})

			const responseData = await retryResponse.json();
			console.log(retryResponse);
			
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'Update failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'Update successful'
			};
		}

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Update failed'
		}
		return {
			status: response.status,
			error: response.error || 'Update successful'
		};

	} catch (error) {
		console.error("Update user:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface UpdatePasswordRequest {
	accToken: string;
	password: string;
}
  
export interface UpdatePasswordResponse {
	status: number;
	error?: string;
}
  
export async function updatePassword(userData: UpdatePasswordRequest, id: string): Promise<UpdatePasswordResponse> {
	try {
			const options = {
				method: 'PUT',
				body: JSON.stringify({password: userData.password}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${userData.accToken}`
				}
			}

		const response = await authFetch(`/api/user/pwd/${id}`, options);

		if (response.status === 1) {
			const retryResponse = await fetch(`/api/user/pwd/${id}`, {
				method: 'PUT',
				body: JSON.stringify({password: userData.password}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			})

			const responseData = await retryResponse.json();
			console.log(retryResponse);
			
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'Update failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'Update successful'
			};
		}

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Update failed'
		}
		return {
			status: response.status,
			error: response.error || 'Update successful'
		};

	} catch (error) {
		console.error("Update password:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
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
		console.error("Get user error:", error);
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

export interface GetMatchHistoryRequest {
	accToken: string;
}

export interface GetMatchHistoryResponse {
	status: number;
	data?: MatchHistory[];
	error?: string;
}

export async function getMatchHistory(requestData: GetMatchHistoryRequest, userId: string): Promise<GetMatchHistoryResponse> {
	
	try {
			const options = {
				method: 'GET',
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${requestData.accToken}`,
				}
			}

			const response = await authFetch(`/api/user/${userId}/match_history`, options);

			if (response.status === 1) {
				const retryResponse = await fetch(`/api/user/${userId}/match_history`, {
					method: 'GET',
					headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${response.newToken}`,
					}
				})

				const responseData = await retryResponse.json();

			if (!retryResponse.ok) {
				return {
					status: retryResponse.status,
					error: responseData.error || 'Failed to fetch match history (retry)',
				};
			}

			return {
				status: retryResponse.status,
				data: responseData as MatchHistory[],
			};
		}

		if (response.status >= 300) {
			return {
				status: response.status,
				error: response.error || 'Failed to fetch match history',
			};
		}
		return {
			status: response.status,
			data: response.matchHistory as MatchHistory[] || [],
		}

	} catch (error) {
		console.error("Fetch match history:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.',
		};
	}
}
