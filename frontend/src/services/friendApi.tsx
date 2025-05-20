import { User, authFetch } from "./api";

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
			data: response.userData
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