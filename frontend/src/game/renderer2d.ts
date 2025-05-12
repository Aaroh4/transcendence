import { GameState, GameRenderer } from "./frontEndGame";

export class Renderer2D implements GameRenderer{
	private container : HTMLElement;
	private gameCanvas : HTMLCanvasElement;
	private canvasWidth : number = 800;
	private canvasHeight : number = 600;
	private ctx: CanvasRenderingContext2D;


	init(container: HTMLElement): void {
		this.container = container;
		this.gameCanvas = document.createElement("canvas");
		this.container.appendChild(this.gameCanvas);
		this.ctx = this.gameCanvas.getContext("2d")!;
		//this.container.innerHTML = ""; // new
	}

render(state: GameState): void {
	const ctx = this.ctx;

	if (!ctx) { return; }

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, 800, 600);

	for (let i = 0; i <= 600; i += 30) {
		ctx.fillStyle = "white";
		ctx.fillRect(400 - 10, i + 5, 15, 20);
	}

	ctx.font = "48px 'Comic Sans MS', cursive, sans-serif";
	ctx.fillStyle = "white";
	ctx.fillText(state.score2.toString(), 400 - 96, 50);
	ctx.fillText(state.score1.toString(), 400 + 48, 50);

	ctx.fillStyle = state.color;
	ctx.fillRect(state.ballX, state.ballY, state.ballSize, state.ballSize);
	ctx.fillRect(10, state.player1Y, 10, state.player1Height);
	ctx.fillRect(780, state.player2Y, 10, state.player2Height);

	//if (state.isAIgame && state.AIdebug) {
	// assume GameAI draws globally or pass it in render if needed
	//	window.gameAI?.drawAIPrediction(ctx);
	//}
	}


	dispose(): void {
		if (this.gameCanvas?.parentElement) {
			this.gameCanvas.remove();
		}
	}
}
