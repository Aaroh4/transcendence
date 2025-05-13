// src/types/global.d.ts
import type { frontEndGame } from "../game/frontEndGame";

declare global {
	interface Window {
		game?: frontEndGame;
	}
}