// @ts-ignore
import { Logger, LogLevel } from '../utils/logger.js';
import { TURN_USER, TURN_PASS, EXT_IP, STUN_URL} from '../config/env-config.js';
import { setupButtons  } from './matchmaking.js';
import { router } from '../App';
import { GameAI } from './gameAI';
import { Renderer2D } from './renderer2d.js';
import { Renderer3D } from './renderer3d.js';

const log = new Logger(LogLevel.INFO);

log.info("UI ready")

let totalGameCount = 0;

export class Entity {
	public yVel: number;
	public xVel: number;
	public height: number;
	public width: number;
	public yPos: number;
	public xPos: number;
	public speed: number;

	constructor(h, w, y, x) {
		this.yVel = 0;
		this.xVel = 0;
		this.height = h;
		this.width = w;
		this.yPos = y;
		this.xPos = x;
	}

	getpos() {
		return [this.yPos, this.xPos];
	}

	lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}
}

// Ball and the logic for it
export class Ball extends Entity {
	constructor(h, w, y, x) {
		super(h, w, y, x);
		this.speed = 10;

		this.xVel = Math.random() < 0.5 ? 1 : -1;
		this.yVel = Math.random() < 0.5 ? 1 : -1;
	}

	resetPosition(scorer: 1 | 2, game) {

		this.yPos = game.canvasHeight / 2 - this.height / 2;

		if (scorer === 1) {
			// Ball starts near left side, goes right toward P1
			this.xPos = 50;
			this.xVel = 1;
		} else {
			// Ball starts near right side, goes left toward P2
			this.xPos = game.canvasWidth - 50 - this.width;
			this.xVel = -1;
		}

		this.yVel = Math.random() < 0.5 ? 1 : -1; // random vertical
	}

	update(player, player2, deltaTime) {

		const length = Math.hypot(this.xVel, this.yVel);
		this.xVel = (this.xVel / length);
		this.yVel = (this.yVel / length);

		const nextX = this.xPos + this.xVel * this.speed * deltaTime;
		const nextY = this.yPos + this.yVel * this.speed * deltaTime;

		const scoreMargin = 5; // adjust to prevent hits with paddle ends

		if (nextX <= scoreMargin) {
			game.setScore(1, 0);
			this.resetPosition(2, game);
			return; // skip position update this frame
		} else if (nextX + this.width >= game.canvasWidth - scoreMargin) {
			game.setScore(0, 1);
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
			//this.xVel = 1;
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
			//this.xVel = -1;
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

// Player and the logic for it
export class Player extends Entity {
	constructor(h, w, y, x) {
		super(h, w, y, x);
		this.speed = 8;
	}

	setvel(velocityY) {
		this.yVel = velocityY;
	}

	move(deltaTime) {
		const nextY = this.yPos + this.yVel * this.speed * deltaTime;
		
		if (nextY + this.height >= 600) return;
		else if (nextY + this.height <= 0) return;

		this.yPos += this.yVel * this.speed * deltaTime;
	}

	setpos(value) {
		this.yPos = value;
	}
}

enum KeyBindings{
	UP = 'KeyW',
  DOWN = 'KeyS',
	SUP = 'ArrowUp',
	SDOWN = 'ArrowDown'
}

export interface GameState {
	canvasWidth: number;
	canvasHeight: number;
	player1Y: number;
	player2Y: number;
	player1Height: number;
	player2Height: number;
	ballSize: number;
	ball: Ball | null;
	player1Score: number;
	player2Score: number;
	color: string;
	gameAI: GameAI;
	isAIgame: boolean;
	AIdebug: boolean;
}

export interface GameRenderer {
	init(state: GameState): void;
	dispose(): void;
	render(state: GameState): void;
}

export class frontEndGame {
	private keysPressed: { [key: string]: boolean } = {};
	public 	canvasWidth : number = 800;
	public 	canvasHeight : number = 600;
	private renderer: GameRenderer | null = null;
	public  currentMode: '2D' | '3D' = '3D';
	private color : string;
	private player1Score : number = 0;
	private player2Score : number = 0;
	private player1 : Player | null = null;
	private player2 : Player | null = null;
	private ballSize : number;
	private ball: Ball | null = null;
	private lastUpdateTime: number;
	private isAIgame: boolean = false;
	private gameAI: GameAI | null = null;
	private AIdebug: boolean = false;

	private dataChannel: RTCDataChannel | null = null;
  private peerConnection: RTCPeerConnection | null = null;
	private configuration: RTCConfiguration;

	// Add a property to store candidates that arrive before remote description
	private bufferedCandidates: RTCIceCandidateInit[] = [];

	private keyDownHandler: (e: KeyboardEvent) => void;
	private keyUpHandler: (e: KeyboardEvent) => void;

	constructor() {

		this.player1 = new Player(60, 10, 300, 10);
		this.player2 = new Player(60, 10, 300, 780);
		this.configuration = {
			iceServers: [
				{
					urls: "turn:"+EXT_IP+":3478",
					username: TURN_USER,
					credential: TURN_PASS
				},
				{
					urls: STUN_URL
				}
			]
		};
	}

	getGameState(): GameState {
		return {
			canvasWidth: this.canvasWidth,
			canvasHeight: this.canvasHeight,
			player1Y: this.player1.getpos()[0],
			player2Y: this.player2.getpos()[0],
			player1Height: this.player1.height,
			player2Height: this.player2.height,
			ball: this.ball,
			ballSize: this.ballSize,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			color: this.color,
			gameAI: this.gameAI,
			isAIgame: this.isAIgame,
			AIdebug: this.AIdebug
		};
	}

	setIsAIgame(isAIgame: boolean) {
		this.isAIgame = isAIgame;
	}

	setScore(player1Score, player2Score) {
		this.player1Score += player1Score;
		this.player2Score += player2Score;
	}

	createRenderingContext() {	
		if (this.currentMode === '2D') {
			this.renderer = new Renderer2D();
		} else {
			this.renderer = new Renderer3D();
		}
		this.renderer.init(this.getGameState());
	}

	setupAI() 
	{
		this.gameAI = new GameAI(this.canvasHeight, this.player2.xPos, this.player2.height);
	}

	setupPeerConnectionEvents(socket) {
		log.info("Setting up peer connection events");
		// Send ICE candidates to backend explicitly
		this.peerConnection.onicecandidate = event => {
			if (event.candidate) {
				log.info("ICE candidate generated");
				log.debug(event.candidate);
				socket.emit('ice-candidate', event.candidate);
			} else {
				log.info("ICE candidate gathering complete");
			}
		};
			
		// Handle incoming data channel from server
		this.peerConnection.ondatachannel = (event) => {
			log.info("Received data channel from server");
			this.dataChannel = event.channel;
			  
			this.dataChannel.onopen = () => {
				log.info("Data channel explicitly OPENED");
				this.setupKeyListeners(this.dataChannel);
			};
			  
			this.dataChannel.onclose = () => log.info("Data channel closed");
			this.dataChannel.onerror = (e) => log.error("Data channel error:", e);
			  
			this.dataChannel.onmessage = (e) => {
				log.debug("Message received from backend:", e.data);
				try {
					const data = JSON.parse(e.data);
					if (data.type === 'gameState') {
						this.updateFromBackend(data.positions, data.velocities, data.scores);
						log.debug(" Game state updated");
					}
				} catch (err) {
					log.error("Error handling data channel message:", err);
				}
			};
		};
			
		this.peerConnection.onconnectionstatechange = () => {
			log.debug("Connection state:", this.peerConnection.connectionState);
		};
	
		this.peerConnection.oniceconnectionstatechange = () => {
			log.debug("ICE connection state:", this.peerConnection.iceConnectionState);
		};
	}

	cleanUp() {
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
            this.keyDownHandler = null;
        }
        
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
            this.keyUpHandler = null;
        }

		if (this.dataChannel) {
			this.dataChannel.close();
			this.dataChannel = null;
		}
		if (this.peerConnection) {
			this.peerConnection.close();
			this.peerConnection = null;
		}
		log.info("Cleaned up game resources");
	}

	setupKeyListeners(dataChannel) {
		log.info("Setting up key listeners");
        this.keyDownHandler = (e) => {
            if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
                const data = { key: e.code, isPressed: true };
                log.debug("Sending key down event:", data);
                dataChannel.send(JSON.stringify(data));
            }
        };
        
        this.keyUpHandler = (e) => {
            if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
                const data = { key: e.code, isPressed: false };
                log.debug("Sending key up event:", data);
                dataChannel.send(JSON.stringify(data));
            }
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
	}

	setupSoloKeyListeners() {
        this.keyDownHandler = (e) => {
            this.keysPressed[e.code] = true;
        };
        
        this.keyUpHandler = (e) => {
            this.keysPressed[e.code] = false;
        };

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
	}

	updateFromBackend(positions, velocities, scores) {

		log.info("Updating game state from backend");

		this.player1Score = scores[0];
		this.player2Score = scores[1];

		if (positions && positions.length >= 3 &&
				velocities && velocities.length >= 3
		) {
		  // Update player 1 position
		  this.player1.setpos(positions[0][0]);
			this.player1.setvel(velocities[0][0]);
		  
		  // Update player 2 position
		  this.player2.setpos(positions[1][0]);
			this.player2.setvel(velocities[1][0]);
		  
		  // Update ball position
		  this.ball.yPos = positions[2][0];
		  this.ball.xPos = positions[2][1];

			// Update ball position with lerp
			//this.ball.xPos = this.ball.lerp(this.ball.xPos, positions[2][1], 0.2);
			//this.ball.yPos = this.ball.lerp(this.ball.yPos, positions[2][0], 0.2);

			// Update ball velocity
		  this.ball.yVel = velocities[2][0];
		  this.ball.xVel = velocities[2][1];

		  // Decoupled rendering from backend updates
			this.renderer.render(this.getGameState());
		} else {
			log.error("Invalid positions or velocities received from backend, shit happens.");
		}
	}

	updateNetworkGameState() {
		const now = performance.now();
		const deltaTime = (now - this.lastUpdateTime) / 16.67; // Normalize to ~60 FPS
		this.lastUpdateTime = now;
		// const dir = this.currentMode === '3D' ? -1 : 1;

		// if (this.keysPressed[KeyBindings.UP])
		// 	this.player1.setvel(-1 * dir);
		// else if (this.keysPressed[KeyBindings.DOWN])
		// 	this.player1.setvel(1 * dir);	
		// else
		// 	this.player1.setvel(0);

		// if (this.keysPressed[KeyBindings.SUP]) 
		// 	this.player2.setvel(-1 * dir);
		// else if (this.keysPressed[KeyBindings.SDOWN])
		// 	this.player2.setvel(1 * dir);
		// else
		// 	this.player2.setvel(0);

		this.player1.move(deltaTime);
		this.player2.move(deltaTime);
		this.ball.update(this.player1, this.player2, deltaTime);	
	}

	updateSoloGameState()
	{
		const now = performance.now();
		const deltaTime = (now - this.lastUpdateTime) / 16.67; // Normalize to ~60 FPS
		this.lastUpdateTime = now;
		const dir = this.currentMode === '3D' ? -1 : 1;

		if (this.keysPressed[KeyBindings.UP])
			this.player1.setvel(-1 * dir);
		else if (this.keysPressed[KeyBindings.DOWN])
			this.player1.setvel(1 * dir);	
		else
			this.player1.setvel(0);

		if (this.keysPressed[KeyBindings.SUP]) 
			this.player2.setvel(-1 * dir);
		else if (this.keysPressed[KeyBindings.SDOWN])
			this.player2.setvel(1 * dir);
		else
			this.player2.setvel(0);

		this.player1.move(deltaTime);
		this.player2.move(deltaTime);
		this.ball.update(this.player1, this.player2, deltaTime);

		this.renderer.render(this.getGameState());
	}

	updateAIGameState()
	{
		const now = performance.now();
		const deltaTime = (now - this.lastUpdateTime) / 16.67; // Normalize to ~60 FPS
		this.lastUpdateTime = now;
		const dir = this.currentMode === '3D' ? -1 : 1;

		if (this.keysPressed[KeyBindings.UP])
			this.player1.setvel(-1 * dir);
		else if (this.keysPressed[KeyBindings.DOWN])
			this.player1.setvel(1 * dir);
		else
			this.player1.setvel(0);

		// Simulate AI player movement
		this.gameAI.getKeyPresses(this.ball, this.player2.getpos()[0]);
		this.keysPressed[KeyBindings.SUP] = this.gameAI.aiPlayerInput.SUP;
		this.keysPressed[KeyBindings.SDOWN] = this.gameAI.aiPlayerInput.SDOWN;

 		if (this.keysPressed[KeyBindings.SUP]) 
			this.player2.setvel(-1);
		else if (this.keysPressed[KeyBindings.SDOWN])
			this.player2.setvel(1);
		else
			this.player2.setvel(0);

		this.player1.move(deltaTime);
		this.player2.move(deltaTime);

		this.ball.update(this.player1, this.player2, deltaTime);
		
		this.renderer.render(this.getGameState());
	}

	settings(settings, color)
	{
		this.color = color;
		const {ballSettings, playerSettings} = settings;
		this.ballSize = ballSettings.ballSize;
		this.ball = ballSettings.ball;
		this.lastUpdateTime = performance.now();
	}

	switchMode(newMode: '2D' | '3D') {
		if (this.currentMode === newMode) return;

		this.renderer.dispose(); // remove canvas or babylon engine
		this.currentMode = newMode;

		if (newMode === '2D') {
			this.renderer = new Renderer2D();
		} else {
			this.renderer = new Renderer3D();
		}
		this.renderer.init(this.getGameState());
	}

	socketLogic(socket)
	{
		socket.on('offer', async (offer) => {
			try {
				if (!this.peerConnection) {
					this.peerConnection = new RTCPeerConnection(this.configuration);
					log.info("Peer connection created");
					this.setupPeerConnectionEvents(socket);
				}

				log.info("Frontend received offer");
				log.debug(offer);
				await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
				
				const answer = await this.peerConnection.createAnswer();
				await this.peerConnection.setLocalDescription(answer);
				socket.emit('answer', answer);
				log.info("Frontend sent answer.");
				log.debug(this.peerConnection.localDescription);
				if (this.bufferedCandidates && this.bufferedCandidates.length > 0) {
					log.info("Processing buffered ICE candidates");
					for (const candidate of this.bufferedCandidates) {
						await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
					}
					this.bufferedCandidates = [];
				}
			} catch (e) {
				log.error("Error handling offer:", e);
			}
		});
		
		socket.on('answer', async (answer) => {
			await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));		  
		});

		socket.on('ice-candidate', async (candidate) => {
			if (!this.peerConnection) {
				log.warn("Received ICE candidate but peer connection not created yet");
				return;
			}
			
			try {
				// Buffer ICE candidates until remote description is set
				if (!this.peerConnection.remoteDescription) {
					log.info("Buffering ICE candidate until remote description is set");
					this.bufferedCandidates = this.bufferedCandidates || [];
					this.bufferedCandidates.push(candidate);
				} else {
					// Add ICE candidate if remote description is already set
					await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
					log.info("Added ICE candidate successfully");
				}
			} catch (e) {
				log.error("Error adding received ICE candidate", e);
			}
		});

		socket.on("connect", () => {
			log.info("Connected to server");
			const strtBtn = document.getElementById("start-btn");
			const gameEdit = document.getElementById("edit-game");
		
			if (strtBtn)
				strtBtn.hidden = true;
			if (gameEdit)
				gameEdit.hidden = true;
		});
		
		socket.on("playerJoined", (playerAmount) => {
			const sizeTxt = document.getElementById("size-txt");
		
			sizeTxt.textContent = "Lobby size: " + playerAmount + "/2";
		});
		
		socket.on("playerDisconnected", (playerAmount) => {
			log.info("Player disconnected");
			const sizeTxt = document.getElementById("size-txt");
		
			sizeTxt.textContent = "Lobby size: " + playerAmount + "/2";
		});
		
		// Room is full!
		socket.on("roomFull", (type) => {
			if (type === "normal") {
				const strtBtn = document.getElementById("start-btn");
				const gameEdit = document.getElementById("edit-game");
			
				const ballSize  = (document.getElementById("ball-size") as HTMLInputElement)
				const ballSpeed = (document.getElementById("ball-speed") as HTMLInputElement)
			
				strtBtn.hidden = false
				gameEdit.hidden = false;
			
				strtBtn.addEventListener("click", () => {
					const ballSizeValue = ballSize.value.trim() === "" ? ballSize.placeholder : ballSize.value;
					const ballSpeedValue = ballSpeed.value.trim() === "" ? ballSpeed.placeholder : ballSpeed.value;
			
					socket.emit("hostStart", {
						ballSettings: {
							ballSize: ballSizeValue,
							ballSpeed: ballSpeedValue
						},
						playerSettings: {
			
						}
					});
				});
			}
			else if (type === "tournament") {
				const container = document.getElementById("game-container")
				const countdownElement = document.createElement("h1");
				countdownElement.id = "countdown";
				countdownElement.textContent = "10";
				container.appendChild(countdownElement);

				let count = 10;
				const intervalId = setInterval(() => {
				  count--;
				  countdownElement.textContent = count.toString();
			
				  if (count === 0) {
					clearInterval(intervalId);
					countdownElement.remove();
				  }
				}, 1000);
			}
		})
		
		// Socket wants to start the game
		socket.on("startGame", (roomId : string, settings) => {
			const select = document.getElementById("colorSelect") as HTMLSelectElement;
			const color = select.options[select.selectedIndex].value;
		
			const winnerElement = document.getElementById("winner-text");
			if (winnerElement) {
				winnerElement.remove();
			}
		
			document.getElementById("gameroom-page").hidden = true;
			document.getElementById("game-wrapper")?.classList.remove("hidden");

			log.info("Game started in room:", roomId);
			
			game.createRenderingContext();
			
			// Create Ball object locally
			const networkBall = new Ball(20, 20, 400, 300); // or use ballSize and midpoint logic

			game.settings({
				ballSettings: {
					ball: networkBall,
					ballSize: settings.ballSettings.ballSize,
					ballSpeed: settings.ballSettings.ballSpeed
				},
				playerSettings: settings.playerSettings
			}, color);

			game.ball = networkBall;

			if (this.peerConnection == null) {
				this.peerConnection = new RTCPeerConnection(this.configuration);
				log.info("Peer connection created");
				this.setupPeerConnectionEvents(socket);
			}

			function loopNetwork() {
				game.updateNetworkGameState();
				animationFrameId = requestAnimationFrame(loopNetwork);
			}
			loopNetwork();
		});
		
		socket.on("gameOver", (winner : number, type : string) => {
			if (type == "normal")
				document.getElementById("gameroom-page").hidden = false;
			var winnerElement = document.createElement("span");
			winnerElement.id = "winner-text";
			winnerElement.textContent = "Winner: " + winner;
			const container = document.getElementById("game-container");
		
			var canvas = container.querySelector("canvas");
		
			canvas.remove();
		
			container.prepend(winnerElement);
			game.cleanUp();
			if (type == "tournament")
			{
				setTimeout(() => {
					router.navigate("/tournaments");
				  }, 3000);
			}
		});

		socket.on("disconnectWin", () => {

			gameToast.open("Other player left You win!", "success");
			setTimeout(() => {
				router.navigate("/tournaments");
			  }, 3000);
		});
	}
}

let game : frontEndGame;
let animationFrameId: number | null = null;
let gameToast;

export function createNewGame(matchType : string, socket, userId : string, toast : any)
{
	gameToast = toast;
	console.log("id: ", userId);
	setupButtons(socket, userId);
	game = new frontEndGame();
	totalGameCount++;
	log.info("Creating new game instance, total count:", totalGameCount);
	if (matchType != "solo" && matchType != "ai")
	{
		game.socketLogic(socket);
	}
	// add game to window object for 2D/3D renderer switching
	window.game = game;
}

export function cleanGame()
{
	log.info("Cleaning up game resources");
	totalGameCount--;
	if (animationFrameId != null)
		cancelAnimationFrame(animationFrameId);
	if (game)
		game.cleanUp();
	game = null;
	log.info("Total game count:", totalGameCount);
} 

export function startSoloGame()
{
	const select = document.getElementById("colorSelect") as HTMLSelectElement;
	const color = select.options[select.selectedIndex].value;
	const ballSize  = (document.getElementById("ball-size") as HTMLInputElement)
	const ballSpeed = (document.getElementById("ball-speed") as HTMLInputElement)
	const ballSizeValue = ballSize.value.trim() === "" ? ballSize.placeholder : ballSize.value;
	const ballSpeedValue = ballSpeed.value.trim() === "" ? ballSpeed.placeholder : ballSpeed.value;

	document.getElementById("gameroom-page").hidden = true;
	document.getElementById("game-wrapper")?.classList.remove("hidden");

	game.setupSoloKeyListeners();
	game.createRenderingContext();
	game.settings({
		ballSettings: {
			ball: new Ball(20, 20, 400, 300),
			ballSize: ballSizeValue,
			ballSpeed: ballSpeedValue
		},
		playerSettings: {

		}
	}, color);
	function loopSolo() {
		game.updateSoloGameState();
		animationFrameId = requestAnimationFrame(loopSolo);
	}
	loopSolo();
}

export function startAIGame()
{
	const select = document.getElementById("colorSelect") as HTMLSelectElement;
	const color = select.options[select.selectedIndex].value;
	const ballSize  = (document.getElementById("ball-size") as HTMLInputElement)
	const ballSpeed = (document.getElementById("ball-speed") as HTMLInputElement)
	const ballSizeValue = ballSize.value.trim() === "" ? ballSize.placeholder : ballSize.value;
	const ballSpeedValue = ballSpeed.value.trim() === "" ? ballSpeed.placeholder : ballSpeed.value;

	game.setIsAIgame(true);
	document.getElementById("gameroom-page").hidden = true;
	document.getElementById("game-wrapper")?.classList.remove("hidden");
	game.setupSoloKeyListeners();
	game.createRenderingContext();
	game.setupAI();
	game.settings({
		ballSettings: {
			ball: new Ball(20, 20, 400, 300),
			ballSize: ballSizeValue,
			ballSpeed: ballSpeedValue
		},
		playerSettings: {

		}
	}, color);
	function loopAI() {
		game.updateAIGameState();
		animationFrameId = requestAnimationFrame(loopAI);
	}
	loopAI();
}