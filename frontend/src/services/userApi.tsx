import { authFetch } from "./api";
import { AUTHSERV } from '../config/env-config.js';

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
	name: string,
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
				accessToken: '',
				refreshToken: '',
				status: response.status,
				error: responseData.error || 'Login failed'
			}
		return {
			userId: responseData.userId,
			name: responseData.name,
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

		if (response.status == 1) {
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
		console.error("Delete user:", error);
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

		if (response.status == 1) {
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
} //force logaout/delete if refreshToken has expired?
