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

/*export interface User {
	name: string;
	email?: string;
	online_status?: number;
	wins?: number;
	losses?: number;
	avatar?: string;
	id: number;
}*/

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
		tourData: responseData.tourData,
		tournaments: responseData.Tournament
	};
}

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


export async function loginUser(userData: LoginRequest, captchaToken): Promise<LoginResponse> {

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
}
//force logaout/delete if refreshToken has expired?

export interface User {
	name: string;
	onlineStatus: boolean;
	wins: number;
	losses: number;
	avatar: string;
	email: string;
	error: string;
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
				onlineStatus: false,
				wins: 0,
				losses: 0,
				avatar: '',
				email: '',
				error: responseData.error
		}
		return { name: responseData.name,
			onlineStatus: responseData.status,
			wins: responseData.wins,
			losses: responseData.losses,
			avatar: responseData.avatar,
			email: responseData.email,
			error: responseData.error
		}
		
	} catch (error) {
		error.console.log();
		console.error("Login error:", error);
		return { name: '',
			onlineStatus: false,
			wins: 0,
			losses: 0,
			avatar: '',
			email: '',
			error: 'Something went wrong. Please try again.'
		};
	}
}


//force logaout/delete if refreshToken has expired?


export interface FriendRequestRequest {
	friendId: number;
	accToken: string;
}

interface FriendRequestResponse {
	status: number;
	error: string;
}

export async function friendRequest(requestData: FriendRequestRequest): Promise<FriendRequestResponse> {
	
	try {
			const options = {
				method: 'POST',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${requestData.accToken}`
				}
			}

		const response = await authFetch('/api/friend/request', options);

		if (response.status === 1) {
			const retryResponse = await fetch(`/api/friend/request`, {
				method: 'POST',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});

			const responseData = await retryResponse.json();
		
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'Friend request failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'Friend request sent successfully'
			};
		};

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Friend request failed'
		}
		return {
			status: response.status,
			error: response.error || 'Friend request sent successfully'
		};

	} catch (error) {
		console.error("friendRequest:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

// with id that doesnt exist in the database. "FOREIGNkey error?? what is this Tomi?"

export interface checkPendingRequest {
	accToken: string;
}


interface checkPendingResponse {
	status: number;
	request_count?: number;
	error?: string;
	data?: User[];
}

export async function checkPending(requestData: checkPendingRequest): Promise<checkPendingResponse> {
	
	try {
			const options = {
				method: 'GET',
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${requestData.accToken}`
				}
			}

		const response = await authFetch('/api/friend/check_pending', options);

		if (response.status === 1) {
			const retryResponse = await fetch(`/api/friend/check_pending`, {
				method: 'GET',
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});

			if (retryResponse.status === 204)
				return {
				status: response.status,
				request_count: response.request_count
			}

			const responseData = await retryResponse.json();
		
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				request_count: responseData.request_count
				}
			return {
				status: retryResponse.status,
				request_count: responseData.request_count,
				data: responseData.data
			};
		}

		if (response.status >= 300)
			return {
			status: response.status,
			request_count: response.request_count
		}
		if (response.status === 204)
			return {
			status: response.status,
			request_count: response.request_count
		}
		return {
			status: response.status,
			request_count: response.request_count,
			data: response.data
		}

	} catch (error) {
		console.error("getFriends Error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface friendActionRequest {
	accToken: string;
	friendId: number;
}

export interface friendActionResponse {
	status: number;
	error?: string;
}

export async function acceptRequest(requestData: friendActionRequest): Promise<friendActionResponse> {

	try {
			const options = {
				method: 'POST',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${requestData.accToken}`
				}
			}

		const response = await authFetch('/api/friend/accept', options);

		if (response.status === 1) {
			const retryResponse = await fetch(`/api/friend/accept`, {
				method: 'POST',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});

			const responseData = await retryResponse.json();
		
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'Accept failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'Accept was successful'
			};
		};

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Accept failed'
		}
		return {
			status: response.status,
			error: response.error || 'Accept was successful'
		};

	} catch (error) {
		console.error("acceptRequest Error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export async function declineRequest(requestData: friendActionRequest): Promise<friendActionResponse> {

	try {
			const options = {
				method: 'POST',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${requestData.accToken}`
				}
			}

		const response = await authFetch('/api/friend/decline', options);

		if (response.status === 1) {
			const retryResponse = await fetch(`/api/friend/decline`, {
				method: 'POST',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});

			const responseData = await retryResponse.json();
		
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'Decline failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'Decline was successful'
			};
		};

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Decline failed'
		}
		return {
			status: response.status,
			error: response.error || 'Decline was successful'
		};

	} catch (error) {
		console.error("acceptRequest Error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export async function blockRequest(requestData: friendActionRequest): Promise<friendActionResponse> {
	
	try {
			const options = {
				method: 'POST',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${requestData.accToken}`
				}
			}

		const response = await authFetch('/api/friend/block', options);

		if (response.status === 1) {
			const retryResponse = await fetch(`/api/friend/block`, {
				method: 'POST',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});

			const responseData = await retryResponse.json();
		
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'Block failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'Block successful'
			};
		};

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Block failed'
		}
		return {
			status: response.status,
			error: response.error || 'Block was successful'
		};


	} catch (error) {
		console.error("blockRequest Error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface removeFriendRequest {
	accToken: string;
	friendId: number;
}

interface removeFriendResponse {
	status: number;
	error?: string;
}

export async function removeFriend(requestData: removeFriendRequest): Promise<removeFriendResponse> {
	
	try {
			const options = {
				method: 'DELETE',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${requestData.accToken}`
				}
			}

		const response = await authFetch(`/api/friend/remove/${requestData.friendId}`, options);

		if (response.status === 1) {
			const retryResponse = await fetch(`/api/friend/remove/${requestData.friendId}`, {
				method: 'DELETE',
				body: JSON.stringify({ friendId: requestData.friendId }),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});

			const responseData = await retryResponse.json();
		
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'Remove friend failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'Remove friend successful'
			};
		};

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Remove friend failed'
		}
		return {
			status: response.status,
			error: response.error || 'Remove friend successful'
		};


	} catch (error) {
		console.error("blockRequest Error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

interface getAllUsersResponse {
	status: number;
	error?: string;
	users?: User[];
}

export async function getAllUsers(): Promise<getAllUsersResponse> {

	try {
		const response = await fetch('/api/users' ,{
			method: 'GET'
		});

		const responseData = await response.json();

		if (!response.ok)
			return {
			status: response.status,
			error: responseData.error || 'Fetching users failed',
		}
		return {
			status: response.status,
			users: responseData
		}

	} catch (error) {
		console.error("getAllUsers Error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface searchUsersRequest {
	query: string;
}

interface searchUsersResponse {
	status: number;
	error?: string;
	users?: User[];
}

export async function searchUsers(searchInput: searchUsersRequest): Promise<searchUsersResponse> {
	
	try {
		const response = await fetch(`/api/users/search?query=${searchInput.query}`, {
			method: 'GET'
		});

		const responseData = await response.json();

		if (!response.ok)
			return {
			status: response.status,
			error: responseData.error || 'Searching users failed',
		}
		return {
			status: response.status,
			users: responseData
		}

	} catch (error) {
		console.error("searchUsers Error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface getFriendsRequest {
	accToken: string;
}

interface getFriendsResponse {
	status: number;
	error?: string;
	users?: User[];
}

export async function getFriends(requestData: getFriendsRequest): Promise<getFriendsResponse> {

	try {
			const options = {
				method: 'GET',
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${requestData.accToken}`
				}
			}

		const response = await authFetch('/api/friends', options);

		if (response.status === 1) {
			const retryResponse = await fetch(`/api/friends`, {
				method: 'GET',
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});

			if (retryResponse.status === 204) 
				return {
				status: retryResponse.status,
				// error: responseData.error || 'Empty friends list',
				users: []
			}

			const responseData = await retryResponse.json();
		
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'Fetching friends failed'
				}
			return {
				status: retryResponse.status,
				users: responseData
			};
		}

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'Fetching friends failed',
		}
		if (response.status === 204)
			return {
			status: response.status,
			// error: response.error || 'Empty friends list',
			users: []
		}
		return {
			status: response.status,
			users: response.users
		}

	} catch (error) {
		console.error("getFriends Error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
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


/*export async function updatePassword(userData: UpdateUserRequest, id: string): Promise<UpdateUserResponse> {
	try {
		const requestBody = JSON.stringify({
			password: userData.password,
		});

		const initialOptions = {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${userData.accToken}`
			},
			body: requestBody
		};

		const response = await fetch(`/api/user/pwd/${id}`, initialOptions);
		const responseData = await response.json();

		if (responseData.status === 1 && responseData.newToken) {
			const retryOptions = {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${responseData.newToken}`
				},
				body: requestBody
			};

			const retryResponse = await fetch(`/api/user/pwd/${id}`, retryOptions);
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
}*/

/*export async function uploadAvatar(uploadData: UploadImageRequest): Promise<UploadImageResponse> {
	try {
		const formData = new FormData();
		formData.append('image', uploadData.file);

		const options = {
			method: 'POST',
			body: formData,
			headers: {
				'Authorization': `Bearer ${uploadData.accToken}`
			}
		};

		const response = await authFetch('/api/upload', options);

		if (response.status === 1) {
			const retryFormData = new FormData();
			retryFormData.append('image', uploadData.file);

			const retryResponse = await fetch('/api/upload', {
				method: 'POST',
				body: retryFormData,
				headers: {
					'Authorization': `Bearer ${response.newToken}`
				}
			});

			const responseData = await retryResponse.json();

			if (!retryResponse.ok) {
				return {
					status: retryResponse.status,
					error: responseData.error || 'Image upload failed'
				};
			}

			return {
				status: retryResponse.status,
				error: responseData.error || 'Image upload successful',
			};
		}

		if (response.status >= 300) {
			return {
				status: response.status,
				error: response.error || 'Image upload failed'
			};
		}

		return {
			status: response.status,
			error: response.error || 'Image upload successful',
		};

	} catch (error) {
		console.error("Upload image:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}*/ 

//authfetch ei tykkää fileistä ja pakottaa content typen

/*export async function updateUser(userData: UpdateUserRequest, id: string): Promise<UpdateUserResponse> {
	try {
		const options = {
		method: 'PUT',
		body: JSON.stringify({
			name: userData.name,
			email: userData.email,
			number: userData.number,
			password: userData.password,
		}),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${userData.accToken}`
		}
		};

		const response = await authFetch(`${API_AUTH_URL}/api/user/${id}`, options);

		if (response.status === 1) {

			const retryOptions = {
				method: 'PUT',
				body: JSON.stringify({
				name: userData.name,
				email: userData.email,
				number: userData.number,
				password: userData.password,
				}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			};

			const retryResponse = await fetch(`${API_AUTH_URL}/api/user/${id}`, retryOptions);
			const responseData = await retryResponse.json();

			if (!retryResponse.ok) {
				return {
				status: retryResponse.status,
				error: responseData.error || 'Update failed',
				};
			}

			return {
				status: retryResponse.status,
				error: responseData.error || 'Update successful',
			};
		}

		if (response.status >= 300) {
			return {
				status: response.status,
				error: response.error || 'Update failed',
			};
			}

		return {
		status: response.status,
		error: response.error || 'Update successful',
		};

	} catch (error) {
		console.error("Update user:", error);
		return {
		status: 500,
		error: 'Something went wrong. Please try again.',
		};
	}
}*/


/*export async function updatePassword(userData: UpdateUserRequest, id: string): Promise<UpdateUserResponse> {
	try {
		const options = {
		method: 'PUT',
		body: JSON.stringify({
			password: userData.password,
		}),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${userData.accToken}`
		}
		};

		const response = await authFetch(`${API_AUTH_URL}/api/user/pwd/${id}`, options);

		if (response.status === 1) {

			const retryOptions = {
				method: 'PUT',
				body: JSON.stringify({
				password: userData.password,
				}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			};

			const retryResponse = await fetch(`${API_AUTH_URL}/api/user/pwd/${id}`, retryOptions);
			const responseData = await retryResponse.json();

			if (!retryResponse.ok) {
				return {
				status: retryResponse.status,
				error: responseData.error || 'Update failed',
				};
			}

			return {
				status: retryResponse.status,
				error: responseData.error || 'Update successful',
			};
		}

		if (response.status >= 300) {
			return {
				status: response.status,
				error: response.error || 'Update failed',
			};
			}

		return {
		status: response.status,
		error: response.error || 'Update successful',
		};

	} catch (error) {
		console.error("Update user:", error);
		return {
		status: 500,
		error: 'Something went wrong. Please try again.',
		};
	}
}*/

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
		const response = await fetch(`/api/user/${userId}/match_history`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${requestData.accToken}`,
			},
		});

		const responseData = await response.json();

		if (responseData.status === 1 && responseData.newToken) {
			const retryResponse = await fetch(`/api/user/${userId}/match_history`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${responseData.newToken}`,
				},
			});

			const retryData = await retryResponse.json();

			if (!retryResponse.ok) {
				return {
					status: retryResponse.status,
					error: retryData.error || 'Failed to fetch match history (retry)',
				};
			}

			return {
				status: retryResponse.status,
				data: retryData as MatchHistory[],
			};
		}

		if (!response.ok) {
			return {
				status: response.status,
				error: responseData.error || 'Failed to fetch match history',
			};
		}

		return {
			status: response.status,
			data: responseData as MatchHistory[],
		};

	} catch (error) {
		console.error("Fetch match history:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.',
		};
	}
}



