const socket = io();

enum KeyBindings{
UP = 'KeyW',
    DOWN = 'KeyS'
}

class keyBind {
	private static keysPressed: { [key: string]: boolean } = {};
	private testbtn : HTMLElement;
	private gameCanvas : HTMLCanvasElement;
	private ctx : CanvasRenderingContext2D;
	public player1PosY : number = 30;
	public player2PosY : number = 30; // change public to private later
	public ballY : number;
	public ballX : number;


    private peerConnection: RTCPeerConnection | null = null;
    private dataChannel: RTCDataChannel | null = null;
    
    private configuration: RTCConfiguration = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302',
            }//,
            //// Optional TURN server (can be added later if needed)
            //{
            //    urls: 'turn:your-turn-server.example.com', // TURN server URL
            //    username: 'username', // Optional TURN credentials
            //    credential: 'password', // Optional TURN credentials
            //},
        ],
    };

	constructor()
	{
		this.gameCanvas = document.createElement("canvas");
		document.body.appendChild(this.gameCanvas);
		this.ctx = this.gameCanvas.getContext("2d")!;
		this.gameCanvas.width = 800;
		this.gameCanvas.height = 600;

		this.testbtn = document.getElementById("test-btn");
		this.testbtn.addEventListener("click", () => {
			const room : number = 1;
			socket.emit("joinRoom", room);
		});

        this.setupSignaling();	
	}

    public async startWebRTC(): Promise<void> {
        try {
            // Initialize peer connection
            this.peerConnection = new RTCPeerConnection(this.configuration);

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                if (event.candidate) {
                    console.log('ICE Candidate:', event.candidate);
                    socket.emit('iceCandidate', event.candidate); // Send candidate to signaling server
                }
            };

            // Create data channel (for sending game data like player positions)
            this.dataChannel = this.peerConnection.createDataChannel('gameDataChannel');
            this.dataChannel.onopen = () => {
                console.log('Data channel opened');
            };
            this.dataChannel.onmessage = (event) => {
                // Handle messages from the other player
                console.log('Message from remote:', event.data);
            };

            // Create offer and set it as local description
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            console.log('Offer created and set as local description');

            // Emit the offer to the signaling server
            socket.emit('offer', offer);
        } catch (error) {
            console.error('Error with WebRTC setup:', error);
        }
    }

    // Setup signaling for offer/answer/ice candidates
    private setupSignaling(): void {
        // Listen for the offer from the remote peer
        socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
            console.log('Offer received:', offer);

            if (this.peerConnection) {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                console.log('Offer set as remote description');

                // Create an answer and set it as the local description
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                console.log('Answer created and set as local description');

                // Send the answer back to the signaling server
                socket.emit('answer', answer);
            }
        });

        // Listen for the answer from the remote peer
        socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
            if (this.peerConnection) {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                console.log('Answer received');
            }
        });

        // Listen for ICE candidates from the remote peer
        socket.on('iceCandidate', (candidate: RTCIceCandidate) => {
            if (this.peerConnection) {
                this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                    .then(() => {
                        console.log('ICE Candidate added');
                    })
                    .catch((error) => {
                        console.error('Error adding ICE candidate:', error);
                    });
            }
        });
    }
	

	//public sendGameData(): void {
    //    if (this.dataChannel && this.dataChannel.readyState === 'open') {
    //        // Send player positions or any game-related data
    //        const gameData = {
    //            player1PosY: this.player1PosY,
    //            player2PosY: this.player2PosY,
    //            ballX: this.ballX,
    //            ballY: this.ballY
    //        };
    //        this.dataChannel.send(JSON.stringify(gameData));
    //    }
    //}

	updateGraphics() 
	{
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		for (var i = 0; i <= this.gameCanvas.height; i += 30) {
			this.ctx.fillStyle = "red";
			this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
		}
		this.ctx.fillStyle = "red";
		this.ctx.fillRect(this.ballX, this.ballY, 20, 20);
		this.ctx.fillRect(20, this.player1PosY, 10, 50);
		this.ctx.fillRect(780, this.player2PosY, 10, 50);
		//Game.testnum
	}

	keyDown()
	{
		document.addEventListener('keydown', (e) => 
		{
			keyBind.keysPressed[e.code] = true;
			socket.emit('keysPressed', keyBind.keysPressed)
		});

		document.addEventListener('keyup', (e) => 
		{
			keyBind.keysPressed[e.code] = false;
			socket.emit('keysPressed', keyBind.keysPressed);
		});
	}
	//static loop()
	//{
	//	console.log("Working");
	//	socket.emit('keysPressed', keyBind.keysPressed);
	//	requestAnimationFrame(() => keyBind.loop());
	//}
}

socket.on("connect", () => {
	console.log("Connected to server");
});

const keybind = new keyBind();

socket.on("startGame", () => {
	console.log("Game started");
	keybind.updateGraphics();
	keybind.keyDown();
    keybind.startWebRTC();
});

socket.on("updateGame", (posList : number[]) => {
	console.log("Game updated");
	keybind.player1PosY = posList[0][0];
	keybind.player2PosY = posList[1][0];
	keybind.ballY = posList[2][0];
	keybind.ballX = posList[2][1];
	console.log(posList);
	keybind.updateGraphics();
});