const DEBUG_API_URL = 'https://localhost:4000/api/debug-log'; // move to .env if needed

export type DebugLogRequest = {
	label: string;
	uid: string;
	delta: 1 | -1;
};

export async function debugLog(data: DebugLogRequest): Promise<void> {
	try {
		await fetch(DEBUG_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	} catch (err) {
		console.error("Debug log failed:", err);
	}
}
