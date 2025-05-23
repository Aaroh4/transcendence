// BabylonRenderer.ts
import { GameState } from "./frontEndGame";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

const DIGIT_SEGMENTS: { [digit: string]: boolean[] } = {
	"0": [true, true, true, true, true, true, false],
	"1": [false, true, true, false, false, false, false],
	"2": [true, true, false, true, true, false, true],
	"3": [true, true, true, true, false, false, true],
	"4": [false, true, true, false, false, true, true],
	"5": [true, false, true, true, false, true, true],
	"6": [true, false, true, true, true, true, true],
	"7": [true, true, true, false, false, false, false],
	"8": [true, true, true, true, true, true, true],
	"9": [true, true, true, true, false, true, true]
};

const DIGIT_3x5: { [digit: string]: number[][] } = {
  "0": [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  "1": [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  "2": [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
  ],
  "3": [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  "4": [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  "5": [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  "6": [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  "7": [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [1, 0, 0],
  ],
  "8": [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  "9": [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
	":": [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
	],
};


export class Renderer3D {
	private container: HTMLElement;
	private gameCanvas: HTMLCanvasElement;
	private engine: BABYLON.Engine;
	private scene: BABYLON.Scene;
	private camera: BABYLON.FreeCamera;
	private paddle1: BABYLON.Mesh;
	private paddle2: BABYLON.Mesh;
	private leftEdge: BABYLON.Mesh;
	private rightEdge: BABYLON.Mesh;
	private ball: BABYLON.Mesh;
	//private scoreText: GUI.TextBlock;
	private scoreboardRoot: BABYLON.TransformNode | null = null;
	private digitNodes: BABYLON.TransformNode[] = [];
	private digitColor: BABYLON.Color3;
	private digitFlashColor: BABYLON.Color3;
	private digitMaterialP1: BABYLON.StandardMaterial;
	private digitMaterialP2: BABYLON.StandardMaterial;
	private digitMaterialColon: BABYLON.StandardMaterial;
	private lastPlayer1Score = -1;
	private lastPlayer2Score = -1;
	//private guiTexture: GUI.AdvancedDynamicTexture;
	private unitScale = 20;

	private state: GameState;
	

	private to3dX(px: number): number {
		return (px - this.state.canvasWidth / 2) / this.unitScale;
	}

	private to3dZ(py: number): number {
		return (py - this.state.canvasHeight / 2) / this.unitScale;
	}

	private createDigit(parent: BABYLON.TransformNode, digit: string, scene: BABYLON.Scene, segmentSize = 0.4): void {
		const on = DIGIT_SEGMENTS[digit];
		if (!on) return;

		const segLength = segmentSize;
		const segThickness = segmentSize / 4;

		const createSegment = (x: number, y: number, rotation: number) => {
			const box = BABYLON.MeshBuilder.CreateBox("segment", {
				height: segThickness,
				width: segLength,
				depth: segThickness / 2 // thin Z
			}, scene);

			box.rotation.z = rotation; // rotate in XY plane
			box.position.set(x, y, 0); // Z stays constant (floating)
			box.parent = parent;

			const mat = new BABYLON.StandardMaterial("mat", scene);
			mat.diffuseColor = this.digitColor;
			box.material = mat;

			return box;
		};
		

		const segments = [
			createSegment(0, 1, 0),                    // A - top
			createSegment(0.5, 0.5, Math.PI / 2),      // B - top right
			createSegment(0.5, -0.5, Math.PI / 2),     // C - bottom right
			createSegment(0, -1, 0),                   // D - bottom
			createSegment(-0.5, -0.5, Math.PI / 2),    // E - bottom left
			createSegment(-0.5, 0.5, Math.PI / 2),     // F - top left
			createSegment(0, 0, 0),                    // G - middle
		];

		segments.forEach((seg, idx) => {
			if (!on[idx]) seg.setEnabled(false);
		});
	}

	private createGridDigit(parent: BABYLON.TransformNode, digit: string, scene: BABYLON.Scene, material: BABYLON.StandardMaterial, cubeSize = 0.3): void {
		const data = DIGIT_3x5[digit];
		if (!data) return;

		for (let row = 0; row < 5; row++) {
			for (let col = 0; col < 3; col++) {
				if (data[row][col]) {
					const cube = BABYLON.MeshBuilder.CreateBox("digitCube", { size: cubeSize }, scene);
					cube.material = material;

					const x = (col - 1) * cubeSize;
					const y = (4 - row) * cubeSize;
					cube.position = new BABYLON.Vector3(x, y, 0);
					cube.parent = parent;
				}
			}
		}
	}

	private animateFlash(material: BABYLON.StandardMaterial, targetColor: BABYLON.Color3, duration = 1500) {
		const originalColor = material.emissiveColor.clone();

		const animation = new BABYLON.Animation(
			"emissiveFlash",
			"emissiveColor",
			30, // frames per second
			BABYLON.Animation.ANIMATIONTYPE_COLOR3,
			BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
		);

		const keys = [
			{ frame: 0, value: originalColor },
			{ frame: 5, value: targetColor },
			{ frame: 45, value: originalColor }
		];

		animation.setKeys(keys);
		material.animations = [animation];
		this.scene.beginAnimation(material, 0, 45, false);
	}


	init(state: GameState): void {
		this.container = document.getElementById("game-container");
		this.container.innerHTML = ""; // Clear the container
		this.gameCanvas = document.createElement("canvas");
		this.gameCanvas.id = "babylon-canvas";
		this.state = state;
		this.gameCanvas.style.width = this.state.canvasWidth + "px";
		this.gameCanvas.style.height = this.state.canvasHeight + "px";
		this.container.appendChild(this.gameCanvas);

		this.engine = new BABYLON.Engine(this.gameCanvas, true);
		this.scene = new BABYLON.Scene(this.engine);

		this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 15, -45), this.scene);
		this.camera.setTarget(BABYLON.Vector3.Zero());
		this.camera.attachControl(this.gameCanvas, true);

		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);

		const ground = BABYLON.MeshBuilder.CreateGround("ground", {
			width: this.state.canvasWidth / this.unitScale,
			height: this.state.canvasHeight / this.unitScale
		}, this.scene);

		const groundMat = new BABYLON.StandardMaterial("mat", this.scene);
		groundMat.diffuseColor = BABYLON.Color3.Green();
		ground.material = groundMat;

		this.scoreboardRoot = new BABYLON.TransformNode("scoreboardRoot", this.scene);
		this.scoreboardRoot.position = new BABYLON.Vector3(0, 5, 0);
		this.scoreboardRoot.rotation = new BABYLON.Vector3(0, 0, 0);

		this.digitColor = BABYLON.Color3.FromHexString("#00cccc")
		this.digitFlashColor = BABYLON.Color3.FromHexString("#ffffff")

		this.digitMaterialP1 = new BABYLON.StandardMaterial("digitMatP1", this.scene);
		this.digitMaterialP1.diffuseColor = this.digitColor;
		this.digitMaterialP1.emissiveColor = this.digitColor;

		this.digitMaterialP2 = new BABYLON.StandardMaterial("digitMatP2", this.scene);
		this.digitMaterialP2.diffuseColor = this.digitColor;
		this.digitMaterialP2.emissiveColor = this.digitColor;

		this.digitMaterialColon = new BABYLON.StandardMaterial("digitMatColon", this.scene);
		this.digitMaterialColon.diffuseColor = this.digitColor;
		this.digitMaterialColon.emissiveColor = this.digitColor;

		this.leftEdge = BABYLON.MeshBuilder.CreateBox("leftEdge", { height: 1, width: this.state.canvasWidth / this.unitScale, depth: 1 }, this.scene);
		this.leftEdge.position.z = -this.state.canvasHeight / this.unitScale / 2 - 0.5;
		this.rightEdge = BABYLON.MeshBuilder.CreateBox("rightEdge", { height: 1, width: this.state.canvasWidth / this.unitScale, depth: 1 }, this.scene);
		this.rightEdge.position.z = this.state.canvasHeight / this.unitScale / 2 + 0.5;

		this.paddle1 = BABYLON.MeshBuilder.CreateBox("p1", { height: 1, width: 1, depth: this.state.player1Height / this.unitScale }, this.scene);
		this.paddle2 = BABYLON.MeshBuilder.CreateBox("p2", { height: 1, width: 1, depth: this.state.player2Height / this.unitScale }, this.scene);
		this.paddle1.position = new BABYLON.Vector3(-19.5, .5, 0);
		this.paddle2.position = new BABYLON.Vector3(19.5, .5, 0);

		this.ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: state.ballSize / this.unitScale }, this.scene);
		console.log("Ball size: ", this.state.ballSize);
		this.ball.position.y = 1;

		// GUI overlay for scores
		// this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
		// this.scoreText = new GUI.TextBlock();
		// this.scoreText.color = "white";
		// this.scoreText.fontSize = 24;
		// this.guiTexture.addControl(this.scoreText);

		var originalUp = this.camera.upVector.clone();
		var originalRotation = this.camera.rotation.clone();
		this.scene.onKeyboardObservable.add((kbInfo) => {
			switch (kbInfo.type) {
				case BABYLON.KeyboardEventTypes.KEYDOWN:
					if (kbInfo.event.key === "1") {
						this.camera.rotation = originalRotation;
						this.camera.position = new BABYLON.Vector3(0, 15, -45);
						this.camera.setTarget(BABYLON.Vector3.Zero());
						this.camera.upVector = originalUp;
						this.scoreboardRoot.rotation = new BABYLON.Vector3(0, 0, 0);
						this.scoreboardRoot.position = new BABYLON.Vector3(0, 9, 0);
					}
					if (kbInfo.event.key === "2") {
						this.camera.position = new BABYLON.Vector3(0, 40, 0);
						this.camera.setTarget(BABYLON.Vector3.Zero());
						this.camera.upVector = originalUp;
						this.camera.rotation.y = Math.PI / -2;
						var forward = this.camera.getForwardRay().direction;
						var rotationMatrix = BABYLON.Matrix.RotationAxis(forward, Math.PI / -2);
						var newUp = BABYLON.Vector3.TransformNormal(this.camera.upVector, rotationMatrix);
						this.camera.upVector = newUp;
						this.scoreboardRoot.rotation = new BABYLON.Vector3( Math.PI / 2, 0, 0);
						this.scoreboardRoot.position = new BABYLON.Vector3(0, 9, 9); // floating above field
					}
					if (kbInfo.event.key === "3") {

						this.camera.rotation = originalRotation;
						this.camera.position = new BABYLON.Vector3(-45, 15, 0);
						this.camera.setTarget(BABYLON.Vector3.Zero());
						this.camera.upVector = originalUp;
						this.scoreboardRoot.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
						this.scoreboardRoot.position = new BABYLON.Vector3(0, 8, 0); // floating above field
					}
					break;
			}
		});

		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}

	render(state: GameState): void {
		this.state = state;

		this.paddle1.position.z = this.to3dZ(state.player1Y + state.player1Height / 2);
		this.paddle2.position.z = this.to3dZ(state.player2Y + state.player2Height / 2);

		this.ball.position.x = this.to3dX(state.ball.xPos) + state.ballSize / this.unitScale / 2;
		this.ball.position.z = this.to3dZ(state.ball.yPos) + state.ballSize / this.unitScale / 2;

		//this.scoreText.text = `${state.player1Score} : ${state.player2Score}`;

		// Clean up old digits
		// 	this.digitNodes.forEach(node => node.dispose());
		// 	this.digitNodes = [];

		// 	const scoreStr = `${state.player1Score.toString().padStart(2, "0")}  ${state.player2Score.toString().padStart(2, "0")}`;
		// 	let startX = -scoreStr.length / 2;

		// 	for (let i = 0; i < scoreStr.length; i++) {
		// 		const char = scoreStr[i];
		// 		if (char === " ") continue;

		// 		const digitNode = new BABYLON.TransformNode("digit", this.scene);
		// 		digitNode.position = new BABYLON.Vector3(startX + i * 1.2, 3, 0); // position above field
		// 		this.createDigit(digitNode, char, this.scene);
		// 		this.digitNodes.push(digitNode);
		// 	}
		// }
		const p1ScoreChanged = state.player1Score !== this.lastPlayer1Score;
		const p2ScoreChanged = state.player2Score !== this.lastPlayer2Score;
		this.lastPlayer1Score = state.player1Score;
		this.lastPlayer2Score = state.player2Score;

		this.digitNodes.forEach(node => node.dispose());
		this.digitNodes = [];

		const scoreStr = `${state.player2Score} : ${state.player1Score}`;
		const digitSpacing = 1.5;

		const visibleChars = [...scoreStr].filter(c => c !== " ");
		const total = visibleChars.length;

		// let displayIndex = 0;
		// for (let i = 0; i < scoreStr.length; i++) {
		// 	const char = scoreStr[i];
		// 	if (char === " ") continue;

		// 	const digitNode = new BABYLON.TransformNode("digit", this.scene);
		// 	digitNode.parent = this.scoreboardRoot;

		// 	// Flip order: first char gets lowest X
		// 	const x = (displayIndex - total / 2) * digitSpacing;
		// 	digitNode.position = new BABYLON.Vector3(x, 0, 0);

		// 	digitNode.rotation = new BABYLON.Vector3(0, 0, 0);
		// 	this.createGridDigit(digitNode, char, this.scene);
		// 	this.digitNodes.push(digitNode);

		// 	displayIndex++;
		// }

		let displayIndex = 0;
		for (let i = 0; i < scoreStr.length; i++) {
			const char = scoreStr[i];
			if (char === " ") continue;

			const digitNode = new BABYLON.TransformNode("digit", this.scene);
			digitNode.parent = this.scoreboardRoot;

			const x = (displayIndex - total / 2) * digitSpacing;
			digitNode.position = new BABYLON.Vector3(x, 0, 0);

			let material = this.digitMaterialColon;
			if (displayIndex < 1) material = this.digitMaterialP1;
			else if (displayIndex > 1) material = this.digitMaterialP2;

			// Apply flash if score changed
			if ((displayIndex > 1 && p1ScoreChanged) || (displayIndex < 1 && p2ScoreChanged)) {
				this.animateFlash(material, this.digitFlashColor);
			}

			digitNode.rotation = new BABYLON.Vector3(0, 0, 0);
			this.createGridDigit(digitNode, char, this.scene, material);
			this.digitNodes.push(digitNode);
			displayIndex++;
		}
	}

	dispose(): void {
		if (this.scene) this.scene.dispose();
		if (this.engine) this.engine.dispose();
		if (this.gameCanvas && this.gameCanvas.parentElement) this.gameCanvas.remove();
	}
}
