// controllers/debugController.js
import { logCreate, logDispose } from '../utils/debugTracker.js';

export async function postDebugLog(request, reply) {
	const { label, uid, delta } = request.body;

	if (delta === 1) {
		logCreate(label, uid);
	} else if (delta === -1) {
		logDispose(label, uid);
	} else {
		console.warn(`⚠️ Invalid delta value received: ${delta}`);
	}

	reply.code(204).send();
}


