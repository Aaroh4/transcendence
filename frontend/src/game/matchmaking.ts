import { Logger, LogLevel } from '../utils/logger.js';
import { startAIGame, startSoloGame } from './frontEndGame.js';

const log = new Logger(LogLevel.INFO);

export function setupButtons(socket, userId)
{
	// Solo game
	const soloBtn = document.getElementById("ready-solo");
	const aiBtn = document.getElementById("ready-ai");
	
	if (soloBtn)
	{
		const gameEdit = document.getElementById("edit-game");

		gameEdit.hidden = false;
		soloBtn.addEventListener("click", () => {
			startSoloGame();
		});
	}

	if (aiBtn)
	{
		const gameEdit = document.getElementById("edit-game");

		gameEdit.hidden = false;
		aiBtn.addEventListener("click", () => {
			startAIGame();
		});
	}

	// Normal matchmaking
	const matchBtn = document.getElementById("ready-match");
	
	if (matchBtn)
	{
		matchBtn.addEventListener("click", () => {
			socket.emit("joinRoomQue");
		});
	}

	// Tournament matchmaking
	const readyBtn = document.getElementById("ready-tour");
	if (readyBtn)
	{
		readyBtn.addEventListener("click", () => {
			console.log("Ready button clicked");
			socket.emit("readyTour", (userId));
		});
	}
}