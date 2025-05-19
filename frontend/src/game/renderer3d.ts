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

		const mat = new BABYLON.StandardMaterial("mat", this.scene);
		mat.diffuseColor = BABYLON.Color3.Blue();
		ground.material = mat;

		this.paddle1 = BABYLON.MeshBuilder.CreateBox("p1", { height: 1, width: 1, depth: this.state.player1Height / this.unitScale }, this.scene);
		this.paddle2 = BABYLON.MeshBuilder.CreateBox("p2", { height: 1, width: 1, depth: this.state.player2Height / this.unitScale }, this.scene);
		this.paddle1.position = new BABYLON.Vector3(-19.5, .5, 0);
		this.paddle2.position = new BABYLON.Vector3(19.5, .5, 0);

		this.ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: state.ballSize / this.unitScale }, this.scene);
		console.log("Ball size: ", this.state.ballSize);
		this.ball.position.y = 1;
		//this.ball.position.x = this.to3dX(state.ball.xPos);
		//this.ball.position.z = this.to3dZ(state.ball.yPos);

		// GUI overlay for scores
		this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
		this.scoreText = new GUI.TextBlock();
		this.scoreText.color = "white";
		this.scoreText.fontSize = 24;
		this.guiTexture.addControl(this.scoreText);

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
