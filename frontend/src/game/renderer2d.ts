import { GameState, GameRenderer } from "./frontEndGame";
import { Ball } from "./frontEndGame";

export class Renderer2D implements GameRenderer{
	private container : HTMLElement;
	private gameCanvas : HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	// constructor() {
	// 	console.log("Constructor Renderer2D");
		
	// 	// this.container = document.getElementById("game-container");
	// }

	init(state: GameState): void {
		console.log("Init Renderer2D");
		this.container = this.container = document.getElementById("game-container");
		this.gameCanvas = document.createElement("canvas");
		this.gameCanvas.height = state.canvasHeight;
		this.gameCanvas.width = state.canvasWidth;
		this.container.appendChild(this.gameCanvas);
		this.ctx = this.gameCanvas.getContext("2d")!;
		this.container.innerHTML = ""; // new
	}

	render(state: GameState): void {
		console.log("Render Renderer2D");
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
		this.ctx.fillRect(state.ballX, state.ballY, state.ballSize, state.ballSize);
		this.ctx.fillRect(10, state.player1Y, 10, state.player1Height);
		this.ctx.fillRect(780, state.player2Y, 10, state.player2Height);
		if (state.isAIgame && state.AIdebug)
		{
			state.gameAI.drawAIPrediction(this.ctx);
		}
		if (state.ball)
		{
			state.ball.draw(this.ctx);
		}
	}


	dispose(): void {
		if (this.gameCanvas?.parentElement) {
			this.gameCanvas.remove();
		}
	}
}
