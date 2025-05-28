"use strict";
import { Logger, LogLevel } from '../utils/logger.js';

const log = new Logger(LogLevel.INFO);

const KeyBindings = {
	UP: "KeyW",
	DOWN: "KeyS"
};

class Entity {
	constructor(h, w, y, x) {
		this.yVel = 0;
		this.xVel = 0;
		this.height = h;
		this.width = w;
		this.yPos = y;
		this.xPos = x;
	}

	draw(ctx) {
		ctx.fillStyle = "red";
		ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
	}

	getPos() {
		return [this.yPos, this.xPos];
	}

	getPoints() {
		return this.points;
	}
}

class Ball extends Entity {
	constructor(h, w, y, x) {
		super(h, w, y, x);
		this.speed = 10;

		this.xVel = Math.random() < 0.5 ? 1 : -1;
		this.yVel = Math.random() < 0.5 ? 1 : -1;
	}

	resetPosition(scorer, game) {

		this.yPos = game.canvasHeight / 2 - this.height / 2;

		if (scorer === 1) {
			// Ball starts near left side, goes right toward P1
			this.xPos = 50;
			this.xVel = 1;
		} else if (scorer === 2) {
			// Ball starts near right side, goes left toward P2
			this.xPos = game.canvasWidth - 50 - this.width;
			this.xVel = -1;
		} else {
			log.error("Invalid scorer value in resetPosition");
			return;
		}

		this.yVel = Math.random() < 0.5 ? 1 : -1; // random vertical
	}

	update(player, player2, deltaTime, game) {
		const length = Math.hypot(this.xVel, this.yVel);
		this.xVel = (this.xVel / length);
		this.yVel = (this.yVel / length);

		const nextX = this.xPos + this.xVel * this.speed * deltaTime;
		const nextY = this.yPos + this.yVel * this.speed * deltaTime;

		const scoreMargin = 5;

		if (nextX <= scoreMargin) {
			player.points++;
			this.resetPosition(2, game);
			return; // skip position update this frame
		} else if (nextX + this.width >= game.canvasWidth - scoreMargin) {
			player2.points++;
			this.resetPosition(1, game);
			return; // skip position update this frame
		}

		if (nextY + this.height >= 600) this.yVel = -1;
		else if (nextY <= 0) this.yVel = 1;

		if (
			nextX <= player.xPos + player.width &&
			nextY + this.height >= player.yPos &&
			nextY <= player.yPos + player.height
		) {
			const paddleCenter = player.yPos + player.height / 2;
			const ballCenter = nextY + this.height / 2;

			const offset = (ballCenter - paddleCenter) / (player.height / 2); // range: -1 to +1
			const maxBounceAngle = Math.PI / 3; // 60 degrees max

			const angle = offset * maxBounceAngle;

			this.xVel = Math.cos(angle);
			this.yVel = Math.sin(angle);

			const len = Math.hypot(this.xVel, this.yVel);
			this.xVel /= len;
			this.yVel /= len;
		}
		if (
			nextX + this.width >= player2.xPos &&
			nextY + this.height >= player2.yPos &&
			nextY <= player2.yPos + player2.height
		) {
			const paddleCenter = player2.yPos + player2.height / 2;
			const ballCenter = nextY + this.height / 2;

			const offset = (ballCenter - paddleCenter) / (player2.height / 2);
			const maxBounceAngle = Math.PI / 3;

			const angle = offset * maxBounceAngle;

			this.xVel = -Math.cos(angle);
			this.yVel = Math.sin(angle);

			const len = Math.hypot(this.xVel, this.yVel);
			this.xVel /= len;
			this.yVel /= len;
		}
	
		this.xPos = nextX;
		this.yPos = nextY;
	}

	set(value)
	{
		this.height = Number(value.ballSize);
		this.width = Number(value.ballSize);
		this.speed = Number(value.ballSpeed);
	}
}

class Player extends Entity {
	constructor(h, w, y, x) {
		super(h, w, y, x);
		this.speed = 8;
		this.keysPressed = {};
		this.points = 0;
	}

	setvel(velocityY) {
		this.yVel = velocityY;
	}

	move(deltaTime) {
		const nextY = this.yPos + this.yVel * this.speed * deltaTime;
		
		if (nextY + this.height >= 600) return;
		else if (nextY + this.yVel <= 0) return;

		this.yPos += this.yVel * this.speed * deltaTime;
	}

	getKeysPressed() {
		return this.keysPressed;
	}

	setKeysPressed(keys) {
		this.keysPressed = keys;
	}
}

class Game {
	constructor(playerOne, playerTwo) {
		this.running = true;
		this.canvasWidth = 800;
		this.canvasHeight = 600;
		this.players = [];
		this.playerIdMap = new Map();

		this.players[0] = new Player(50, 20, 200, 0);
		this.playerIdMap.set(playerOne, 0);

		this.players[1] = new Player(50, 20, 200, 780);
		this.playerIdMap.set(playerTwo, 1);

		this.ball = new Ball(20, 20, this.canvasHeight / 2, this.canvasWidth / 2 - 10);

		this.lastUpdateTime = performance.now();
	}

	settings(settings)
	{
		const {ballSettings, playerSettings} = settings;
		this.ball.set(ballSettings);
	}

	keyDown(e, playerID) {
		log.debug(`keyDown by player: ${this.playerIdMap.get(playerID)}, socket id: ${playerID}`);
		this.players[this.playerIdMap.get(playerID)].setKeysPressed(e);
	}

	getPos() {
		return [this.players[0].getPos(), this.players[1].getPos(), this.ball.getPos()];
	}

	getVel() {
		return [[this.players[0].yVel], [this.players[1].yVel], [this.ball.xVel, this.ball.yVel]];
	}

	getScores()
	{
		return [this.players[0].getPoints(), this.players[1].getPoints()];
	}

	update() {
		const now = performance.now();
		const deltaTime = (now - this.lastUpdateTime) / 16.67; // Normalize to ~60 FPS
		this.lastUpdateTime = now;

		this.players.forEach(player => {
			if (player.getKeysPressed()[KeyBindings.UP]) {
				player.setvel(-1);
			} else if (player.getKeysPressed()[KeyBindings.DOWN]) {
				player.setvel(1);
			} else {
				player.setvel(0);
			}
			player.move(deltaTime);
		});

		this.ball.update(this.players[0], this.players[1], deltaTime, this);
	}

	stop() {
		this.running = false;
		// Clear the game loop timer if it exists
		if (this.gameLoopTimer) {
			clearTimeout(this.gameLoopTimer);
			this.gameLoopTimer = null;
		}
	}

	isRunning()
	{
		return (this.running);
	}
}

export { Game };
