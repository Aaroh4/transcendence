import { loadLoginForm } from '../components/loginForm.js';
import { loadGameRoom } from '../components/gameRoom.js';

window.addEventListener('DOMContentLoaded', () => {
	// Show login form by default
	
	console.log("✅ index.ts loaded successfully!");
	loadLoginForm();

	// Check if accessToken exists in cookies
	const cookies = document.cookie.split(';').reduce((acc, cookie) => {
		const [key, value] = cookie.trim().split('=');
		acc[key] = value;
		return acc;
	}, {} as Record<string, string>);

	// Auto-load game room if token exists
	if (cookies.accessToken) {
		loadGameRoom();
	}
});
