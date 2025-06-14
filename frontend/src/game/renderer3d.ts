// BabylonRenderer.ts
import { GameState } from "./frontEndGame";
import * as BABYLON from "@babylonjs/core";
import { debugTracker } from "../utils/debugTracker";

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
    "9": [true, true, true, true, false, true, true],
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
    private ballMesh: BABYLON.Mesh;
    private scoreboardRoot: BABYLON.TransformNode | null = null;
    private digitNodes: BABYLON.TransformNode[] = [];
    private digitColor: BABYLON.Color3;
    private digitFlashColor: BABYLON.Color3;
    private digitMaterialP1: BABYLON.StandardMaterial;
    private digitMaterialP2: BABYLON.StandardMaterial;
    private digitMaterialColon: BABYLON.StandardMaterial;
    private originalUp: BABYLON.Vector3;
    private originalRotation: BABYLON.Vector3;
    private lastPlayer1Score = -1;
    private lastPlayer2Score = -1;
    private unitScale = 20;
    private zFlipFactor = -1;
    private lastBallSize: number = -1;

    private state: GameState;

    private to3dX(px: number): number {
        return (px - this.state.canvasWidth / 2) / this.unitScale;
    }

    private to3dZ(py: number): number {
        return (
            ((py - this.state.canvasHeight / 2) / this.unitScale) *
            this.zFlipFactor
        );
    }

    private createGridDigit(
        parent: BABYLON.TransformNode,
        digit: string,
        scene: BABYLON.Scene,
        material: BABYLON.StandardMaterial,
        cubeSize = 0.3
    ): void {
        const data = DIGIT_3x5[digit];
        if (!data) return;

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 3; col++) {
                if (data[row][col]) {
                    const cube = BABYLON.MeshBuilder.CreateBox(
                        "digitCube",
                        { size: cubeSize },
                        scene
                    );
                    cube.material = material;

                    const x = (col - 1) * cubeSize;
                    const y = (4 - row) * cubeSize;
                    cube.position = new BABYLON.Vector3(x, y, 0);
                    cube.parent = parent;
                }
            }
        }
    }

    private animateFlash(
        material: BABYLON.StandardMaterial,
        targetColor: BABYLON.Color3,
        duration = 1500
    ) {
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
            { frame: 45, value: originalColor },
        ];

        animation.setKeys(keys);
        material.animations = [animation];
        this.scene.beginAnimation(material, 0, 45, false);
    }

    setSideView(): void {
        this.camera.rotation = new BABYLON.Vector3(0, 0, 0); // no tilt
        this.camera.position = new BABYLON.Vector3(0, 15, -45);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.upVector = new BABYLON.Vector3(0, 1, 0); // force upright
        this.scoreboardRoot.position = new BABYLON.Vector3(0, 9, 0);
    }

    setTopDownView(): void {
        this.camera.position = new BABYLON.Vector3(0, 40, 0);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.upVector = this.originalUp;

        this.camera.rotation.y = Math.PI / -2;
        const forward = this.camera.getForwardRay().direction;
        const rotationMatrix = BABYLON.Matrix.RotationAxis(
            forward,
            Math.PI / -2
        );
        const newUp = BABYLON.Vector3.TransformNormal(
            this.camera.upVector,
            rotationMatrix
        );
        this.camera.upVector = newUp;

        this.scoreboardRoot.position = new BABYLON.Vector3(0, 9, 9); // floating above field
    }

    setPlayerPerspectiveView(): void {
        this.camera.rotation = this.originalRotation;
        this.camera.position =
            this.state.activePlayerId === 1
                ? new BABYLON.Vector3(-45, 15, 0)
                : new BABYLON.Vector3(45, 15, 0);
        console.log(
            "Setting player perspective view for player",
            this.state.activePlayerId
        );
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.upVector = this.originalUp;
        this.scoreboardRoot.position = new BABYLON.Vector3(0, 9, 0);
    }

    handleCameraKey(key: string): void {
        switch (key) {
            case "1":
                this.setSideView();
                break;
            case "2":
                this.setTopDownView();
                break;
            case "3":
                this.setPlayerPerspectiveView();
                break;
            default:
                console.log("Unhandled camera key:", key);
        }
    }

    init(state: GameState): void {
        console.log("Init Renderer3D");
        debugTracker.logCreate("Renderer3D");
        this.container = document.getElementById("game-container");
        //this.container.innerHTML = ""; // Clear the container
        let existing = this.container.querySelector(
            "#babylon-canvas"
        ) as HTMLCanvasElement;
        if (existing) {
            this.gameCanvas = existing;
        } else {
            this.gameCanvas = document.createElement("canvas");
            this.gameCanvas.id = "babylon-canvas";
            this.container.appendChild(this.gameCanvas);
        }
        this.state = state;
        this.gameCanvas.style.width = this.state.canvasWidth + "px";
        this.gameCanvas.style.height = this.state.canvasHeight + "px";
        this.container.appendChild(this.gameCanvas);

        this.engine = new BABYLON.Engine(this.gameCanvas, true);
        this.scene = new BABYLON.Scene(this.engine);

        this.camera = new BABYLON.FreeCamera(
            "camera1",
            new BABYLON.Vector3(0, 15, -45),
            this.scene
        );
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.gameCanvas, true);

        // Disable camera movement keys
        this.camera.keysUp = [];
        this.camera.keysDown = [];
        this.camera.keysLeft = [];
        this.camera.keysRight = [];

        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );

        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            {
                width: this.state.canvasWidth / this.unitScale,
                height: this.state.canvasHeight / this.unitScale,
            },
            this.scene
        );

        const groundMat = new BABYLON.StandardMaterial("mat", this.scene);
        groundMat.diffuseColor = BABYLON.Color3.Green();
        ground.material = groundMat;

        this.scoreboardRoot = new BABYLON.TransformNode(
            "scoreboardRoot",
            this.scene
        );
        this.scoreboardRoot.billboardMode =
            BABYLON.TransformNode.BILLBOARDMODE_ALL;

        this.scoreboardRoot.position = new BABYLON.Vector3(0, 9, 0);
        // billboardmode handles rotation

        this.digitColor = BABYLON.Color3.FromHexString("#00cccc");
        this.digitFlashColor = BABYLON.Color3.FromHexString("#ffffff");

        this.digitMaterialP1 = new BABYLON.StandardMaterial(
            "digitMatP1",
            this.scene
        );
        this.digitMaterialP1.diffuseColor = this.digitColor;
        this.digitMaterialP1.emissiveColor = this.digitColor;

        this.digitMaterialP2 = new BABYLON.StandardMaterial(
            "digitMatP2",
            this.scene
        );
        this.digitMaterialP2.diffuseColor = this.digitColor;
        this.digitMaterialP2.emissiveColor = this.digitColor;

        this.digitMaterialColon = new BABYLON.StandardMaterial(
            "digitMatColon",
            this.scene
        );
        this.digitMaterialColon.diffuseColor = this.digitColor;
        this.digitMaterialColon.emissiveColor = this.digitColor;

        this.leftEdge = BABYLON.MeshBuilder.CreateBox(
            "leftEdge",
            {
                height: 1,
                width: this.state.canvasWidth / this.unitScale,
                depth: 1,
            },
            this.scene
        );
        this.leftEdge.position.z =
            -this.state.canvasHeight / this.unitScale / 2 - 0.5;
        this.rightEdge = BABYLON.MeshBuilder.CreateBox(
            "rightEdge",
            {
                height: 1,
                width: this.state.canvasWidth / this.unitScale,
                depth: 1,
            },
            this.scene
        );
        this.rightEdge.position.z =
            this.state.canvasHeight / this.unitScale / 2 + 0.5;

        this.paddle1 = BABYLON.MeshBuilder.CreateBox(
            "p1",
            {
                height: 1,
                width: 1,
                depth: this.state.player1Height / this.unitScale,
            },
            this.scene
        );
        this.paddle2 = BABYLON.MeshBuilder.CreateBox(
            "p2",
            {
                height: 1,
                width: 1,
                depth: this.state.player2Height / this.unitScale,
            },
            this.scene
        );
        this.paddle1.position = new BABYLON.Vector3(-19.5, 0.5, 0);
        this.paddle2.position = new BABYLON.Vector3(19.5, 0.5, 0);

        this.ballMesh = BABYLON.MeshBuilder.CreateSphere(
            "ball",
            { diameter: state.ballSize / this.unitScale },
            this.scene
        );
        console.log("Ball size: ", this.state.ballSize);
        this.ballMesh.position.y = state.ballSize / this.unitScale / 2;

        this.originalRotation = this.camera.rotation.clone();
        this.originalUp = this.camera.upVector.clone();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    reset(state: GameState): void {
        const diameter = state.ballSize / this.unitScale;
        if (this.ballMesh && this.lastBallSize !== state.ballSize) {
            this.ballMesh.scaling.setAll(diameter);
            this.ballMesh.position.y = diameter / 2;
            this.lastBallSize = state.ballSize;
        }
    }

    render(state: GameState): void {
        this.state = state;

        this.paddle1.position.z = this.to3dZ(
            state.player1Y + state.player1Height / 2
        );
        this.paddle2.position.z = this.to3dZ(
            state.player2Y + state.player2Height / 2
        );

        // Update ball size dynamically if changed
        const expectedDiameter = state.ballSize / this.unitScale;
        if (this.ballMesh.scaling.x !== expectedDiameter) {
            this.ballMesh.scaling.setAll(expectedDiameter);
        }

        console.log(
            `Ball position: (${state.ball.xPos}, ${state.ball.yPos}), Size: ${state.ballSize}`
        );

        // Compute diameter based on current ballSize
        const diameter = state.ballSize / this.unitScale;

        // Ensure ball mesh is scaled correctly
        if (this.ballMesh.scaling.x !== diameter) {
            this.ballMesh.scaling.setAll(diameter);
        }

        // Position the ball centered horizontally and vertically
        this.ballMesh.position.x = this.to3dX(
            state.ball.xPos + state.ballSize / 2
        );

        this.ballMesh.position.z = this.to3dZ(
            state.ball.yPos + state.ballSize / 2
        );

        this.ballMesh.position.y = diameter / 2;

        const p1ScoreChanged = state.player1Score !== this.lastPlayer1Score;
        const p2ScoreChanged = state.player2Score !== this.lastPlayer2Score;
        this.lastPlayer1Score = state.player1Score;
        this.lastPlayer2Score = state.player2Score;

        this.digitNodes.forEach((node) => node.dispose());
        this.digitNodes = [];

        const scoreStr = `${state.player2Score} : ${state.player1Score}`;
        const digitSpacing = 1.5;

        const visibleChars = [...scoreStr].filter((c) => c !== " ");
        const total = visibleChars.length;

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
            if (
                (displayIndex > 1 && p1ScoreChanged) ||
                (displayIndex < 1 && p2ScoreChanged)
            ) {
                this.animateFlash(material, this.digitFlashColor);
            }

            digitNode.rotation = new BABYLON.Vector3(0, 0, 0);
            this.createGridDigit(digitNode, char, this.scene, material);
            this.digitNodes.push(digitNode);
            displayIndex++;
        }
    }

    setActive(): void {
        console.log("Activating Renderer3D");
        //this.engine.runRenderLoop(() => {
        //	this.scene.render();
        //});
        this.gameCanvas.style.display = "block";
    }

    setInactive(): void {
        console.log("Inactivating Renderer2D");
        //this.engine.stopRenderLoop();
        this.gameCanvas.style.display = "none";
    }

    dispose(): void {
        if (this.scene) this.scene.dispose();
        if (this.engine) this.engine.dispose();
        if (this.gameCanvas && this.gameCanvas.parentElement)
            this.gameCanvas.remove();
        debugTracker.logDispose("Renderer3D");
    }
}
