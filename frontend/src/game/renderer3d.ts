// BabylonRenderer.ts
import { GameState } from "./frontEndGame";
import * as BABYLON from "babylonjs";
import * as GUI from "@babylonjs/gui";

export class Renderer3D {
	private container: HTMLElement;
	private gameCanvas: HTMLCanvasElement;
	private canvasWidth : number = 800;
	private canvasHeight : number = 600;
	private engine: BABYLON.Engine;
	private scene: BABYLON.Scene;
	private camera: BABYLON.FreeCamera;
	private paddle1: BABYLON.Mesh;
	private paddle2: BABYLON.Mesh;
	private ball: BABYLON.Mesh;
	// private scoreText: BABYLON.GUI.TextBlock;
	// private guiTexture: BABYLON.GUI.AdvancedDynamicTexture;
	private scoreText: GUI.TextBlock;
	private guiTexture: GUI.AdvancedDynamicTexture;

	init(state: GameState): void {
		this.container = document.getElementById("game-container");
		this.container.innerHTML = "";
		this.gameCanvas = document.createElement("canvas");
		this.gameCanvas.id = "babylon-canvas";
		this.gameCanvas.style.width = state.canvasWidth + "px";
		this.gameCanvas.style.height = state.canvasHeight + "px";
		this.container.appendChild(this.gameCanvas);

		this.engine = new BABYLON.Engine(this.gameCanvas, true);
		this.scene = new BABYLON.Scene(this.engine);

		this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 15, -30), this.scene);
		this.camera.setTarget(BABYLON.Vector3.Zero());
		this.camera.attachControl(this.gameCanvas, true);

		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);

		const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 40, height: 30 }, this.scene);

		const mat = new BABYLON.StandardMaterial("mat", this.scene);
		mat.diffuseColor = BABYLON.Color3.Blue();
		ground.material = mat;

		this.paddle1 = BABYLON.MeshBuilder.CreateBox("p1", { height: 4, width: 0.5, depth: 1 }, this.scene);
		this.paddle2 = BABYLON.MeshBuilder.CreateBox("p2", { height: 4, width: 0.5, depth: 1 }, this.scene);
		this.paddle1.position = new BABYLON.Vector3(-18, 2, 0);
		this.paddle2.position = new BABYLON.Vector3(18, 2, 0);

		this.ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, this.scene);
		this.ball.position.y = 2;

		// GUI overlay for scores
		this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		this.scoreText = new GUI.TextBlock();
		this.scoreText.color = "white";
		this.scoreText.fontSize = 24;
		this.guiTexture.addControl(this.scoreText);

		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}

	render(state: GameState): void {
		this.paddle1.position.z = state.player1Y / 10 - 30 / 2;
		this.paddle2.position.z = state.player2Y / 10 - 30 / 2;
		this.ball.position.x = (state.ballX / 800) * 40 - 20;
		this.ball.position.z = (state.ballY / 600) * 30 - 15;

		this.ball.scaling.setAll(state.ballSize / 20);
		this.ball.material = new BABYLON.StandardMaterial("ballMat", this.scene);
		(this.ball.material as BABYLON.StandardMaterial).diffuseColor = BABYLON.Color3.FromHexString(state.color);

		this.scoreText.text = `${state.player1Score} : ${state.player2Score}`;
	}

	dispose(): void {
		if (this.scene) this.scene.dispose();
		if (this.engine) this.engine.dispose();
		if (this.gameCanvas && this.gameCanvas.parentElement) this.gameCanvas.remove();
	}
}
