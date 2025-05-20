// BabylonRenderer.ts
import { GameState, GameRenderer } from "./frontEndGame";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";



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
	private scoreText: GUI.TextBlock;
	private guiTexture: GUI.AdvancedDynamicTexture;
	private unitScale = 20;

	private state: GameState;
	

	private to3dX(px: number): number {
		return (px - this.state.canvasWidth / 2) / this.unitScale;
	}

	private to3dZ(py: number): number {
		return (py - this.state.canvasHeight / 2) / this.unitScale;
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
		this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
		this.scoreText = new GUI.TextBlock();
		this.scoreText.color = "white";
		this.scoreText.fontSize = 24;
		this.guiTexture.addControl(this.scoreText);

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
					}
					if (kbInfo.event.key === "3") {

						this.camera.rotation = originalRotation;
						this.camera.position = new BABYLON.Vector3(-45, 15, 0);
						this.camera.setTarget(BABYLON.Vector3.Zero());
						this.camera.upVector = originalUp;
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

		// console.log("Ball size: ", state.ballSize);
		// console.log("unitScale: ", this.unitScale);	
		// console.log("Ball state position: ", state.ballX, state.ballY);
		// console.log("Ball position: ", this.ball.position.x, this.ball.position.z);
		// this.ball.scaling.setAll(state.ballSize / (state.canvasWidth / fieldWidth));
		this.scoreText.text = `${state.player1Score} : ${state.player2Score}`;
	}

	dispose(): void {
		if (this.scene) this.scene.dispose();
		if (this.engine) this.engine.dispose();
		if (this.gameCanvas && this.gameCanvas.parentElement) this.gameCanvas.remove();
	}
}
