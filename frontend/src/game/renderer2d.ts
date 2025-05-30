import { GameState, GameRenderer } from "./frontEndGame";
import { debugTracker } from '../utils/debugTracker';

export class Renderer2D implements GameRenderer{
	private container : HTMLElement;
	private gameCanvas : HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private running = false;

	init(state: GameState): void {
		console.log("Init Renderer2D");
		debugTracker.logCreate("Renderer2D");
		this.container = document.getElementById("game-container");
		//this.container.innerHTML = ""; // new
		// Reuse if canvas already exists
		let existing = this.container.querySelector("#canvas-2d") as HTMLCanvasElement;
		if (existing) {
			this.gameCanvas = existing;
		} else {
			this.gameCanvas = document.createElement("canvas");
			this.gameCanvas.height = state.canvasHeight;
			this.gameCanvas.width = state.canvasWidth;
			this.gameCanvas.id = "canvas-2d";
			this.container.appendChild(this.gameCanvas);
		}
		this.ctx = this.gameCanvas.getContext("2d")!;
	}

	render(state: GameState): void {
		//console.log("Rendering 2D frame", state.ball.xPos, state.player1Y);
		//if (!this.running) return;
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
		for (var i = 0; i <= state.canvasHeight; i += 30) {
			this.ctx.fillStyle = "white";
			this.ctx.fillRect(state.canvasWidth / 2 - 10, i + 5, 15, 20);
		}
		this.ctx.font = "48px 'Comic Sans MS', cursive, sans-serif";
		this.ctx.fillText(state.player2Score.toString(), state.canvasWidth / 2 - 48 * 2, 50);
		this.ctx.fillText(state.player1Score.toString(), state.canvasWidth / 2 + 48, 50);
		this.ctx.fillStyle = state.color;
		this.ctx.fillRect(state.ball.xPos, state.ball.yPos, state.ball.height, state.ball.width);
		this.ctx.fillRect(10, state.player1Y, 10, state.player1Height);
		this.ctx.fillRect(780, state.player2Y, 10, state.player2Height);
		if (state.isAIgame && state.AIdebug)
		{
			state.gameAI.drawAIPrediction(this.ctx);
		}
	}

	setActive(): void {
		console.log("Activating Renderer2D");
		this.gameCanvas.style.display = "block";
	}

	setInactive(): void {
		console.log("Inactivating Renderer2D");
		this.gameCanvas.style.display = "none";
	}

	dispose(): void {
		if (this.gameCanvas && this.gameCanvas.parentElement) {
			debugTracker.logDispose("Renderer2D");
			this.gameCanvas.remove();
		}
	}
}
