// debugTracker.js
import fs from 'fs';
import path from 'path';

const LOG_PATH = path.resolve('game_instance.log');
const instanceCounts = {};

function timestamp() {
	return new Date().toISOString();
}

export function logCreate(label, uid) {
	if (!instanceCounts[label]) instanceCounts[label] = 0;
	instanceCounts[label]++;
	writeLog(`[${timestamp()}] [+1] ${label} [uid=${uid}] — count: ${instanceCounts[label]}`);
}

export function logDispose(label, uid) {
	if (!instanceCounts[label]) instanceCounts[label] = 0;
	instanceCounts[label]--;
	writeLog(`[${timestamp()}] [-1] ${label} [uid=${uid}] — count: ${instanceCounts[label]}`);
}

export function logMessage(label, message, uid = '-') {
	writeLog(`[${timestamp()}] [${uid}] ${label}: ${message}`);
}

function writeLog(message) {
	fs.appendFileSync(LOG_PATH, message + '\n');
	console.log(message);
}
