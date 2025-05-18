import { Ball } from "./frontEndGame"

export interface PredictedPath {
	finalY: number;
}

export interface AIPlayerInput {
	SUP: boolean;
	SDOWN: boolean;
}

export class GameAI {
	private canvasHeight: number = 0;
	private targetX: number = 0;
	private predictedPath: PredictedPath | null = null;
	private pathPoints: [number, number][] = [];
	private playerHeight: number = 0;
	private targetY: number = 0;
	private difficulty: number = 0;
	private maxDifficulty: number = 4;

	public aiPlayerInput: AIPlayerInput = {	
		SUP: false,
		SDOWN: false
	};
	private lastPredictionTime: number = 0;

	constructor(
		canvasHeight: number = 600,
		playerX: number = 780,
		playerHeight: number = 80
	) {
		this.canvasHeight = canvasHeight;
		this.targetX = playerX;
		this.playerHeight = playerHeight;
		this.difficulty = Number(sessionStorage.getItem("AIdifficulty")) || 0;
	}

	public getKeyPresses(ball: Ball, yPos: number) {
		// Get the predicted path of the ball
		const now = Date.now();
		const treshold = 4; // Adjust this value as needed

		// console.log("Ball Y Position: ", ball.yPos);
		// console.log("Player Y Position: ", yPos);
		// console.log("Last Prediction Time: ", this.lastPredictionTime);
		const difficultyFactor = (this.maxDifficulty - this.difficulty);

		if (this.lastPredictionTime < now - (1000 + difficultyFactor * 50)) {
			this.pathPoints = [];
			this.predictedPath = this.predict(ball);
			this.lastPredictionTime = now;
			this.targetY = this.predictedPath.finalY - this.playerHeight / 2;
			const r = Math.random();
			const randomAdjust = (Math.random() * this.playerHeight / 3) * difficultyFactor;
			if (r < 0.5) {
				this.targetY += randomAdjust
				console.log("Randomly adjusting target Y +", randomAdjust);
			} else {
				this.targetY -= randomAdjust
				console.log("Randomly adjusting target Y -", randomAdjust);
			}
			// console.log("Predicting new path");
		}

		if (yPos + treshold < this.targetY) {
			this.aiPlayerInput.SDOWN = true;
			this.aiPlayerInput.SUP = false;
		}
		else if (yPos - treshold > this.targetY) {
			this.aiPlayerInput.SUP = true;
			this.aiPlayerInput.SDOWN = false;
		}
		else {
			this.aiPlayerInput.SUP = false;
			this.aiPlayerInput.SDOWN = false;
		}
	}

	// This now accepts your real class instance
	private predict(ball: Ball): PredictedPath {
		let simulatedXVel = ball.xVel * ball.speed;
		let simulatedYVel = ball.yVel * ball.speed;
		let simulatedX = ball.xPos;
		let simulatedY = ball.yPos;
		const radius = ball.height / 2;

		while (simulatedX !== this.targetX) {
			const nextX =
				simulatedXVel > 0
					? Math.min(simulatedX + simulatedXVel, this.targetX)
					: Math.max(simulatedX + simulatedXVel, this.targetX);

			let nextY = simulatedY + simulatedYVel;

			if (nextY - radius < 0 || nextY + radius > this.canvasHeight) {
				simulatedYVel *= -1;
				nextY = simulatedY + simulatedYVel;
			}

			this.pathPoints.push([nextX, nextY]);
			simulatedX = nextX;
			simulatedY = nextY;
		}

		return {
			finalY: simulatedY
		};
	}


	public drawAIPrediction(ctx: CanvasRenderingContext2D) {

		console.log("Drawing AI prediction");
		ctx.strokeStyle = "blue";
		ctx.lineWidth = 2;
		ctx.beginPath();

		for (let i = 0; i < this.pathPoints.length - 1; i++) {
			const [x1, y1] = this.pathPoints[i];
			const [x2, y2] = this.pathPoints[i + 1];
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
		}
		ctx.stroke();
	}
}
