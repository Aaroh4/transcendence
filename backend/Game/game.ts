enum KeyBindings{
    UP = 'KeyW',
    DOWN = 'KeyS'
}

export class Game {
	private width: number = 800;
	private height: number = 600;
	private ball: ball;
	private players: player[] = [];
	private playerIdMap: Map<string, number> = new Map();
	private computer: computer;

	constructor(playerOne : string, playerTwo : string) {
		
		this.players[0] = new player(50, 20, 200, 0);
		this.playerIdMap.set(playerOne, 0);
		this.players[1] = new player(50, 20, 200, 780);
		this.playerIdMap.set(playerTwo, 1);
		this.ball = new ball(20, 20, this.height / 2, this.width / 2 - 10);
		this.computer = new computer(50, 20, 200, 780);

  
		//document.addEventListener('keydown', (e) => 
		//{
		//	Game.keysPressed[e.code] = true;
		//});

		//document.addEventListener('keyup', (e) => 
		//{
		//	Game.keysPressed[e.code] = false;
		//});
        setInterval(() => this.update(this), 1000/60);
	}

	keyDown(e : {[key: string]: boolean }, playerID: string)
	{
		console.log(this.playerIdMap.get(playerID) + " : " + playerID);
		this.players[this.playerIdMap.get(playerID)].setKeysPressed(e);
	}

	getPos()
	{
		return [this.players[0].getpos(), this.players[1].getpos(), this.ball.getpos()];
	}

	startGame()
	{
		// start calling gameloop here
	}

	static gameLoop(gameInstance: Game) 
	{
		gameInstance.update(gameInstance);
		gameInstance.updateGraphics();
		//gameInstance.ball.draw(gameInstance.ctx);
		//gameInstance.player.draw(gameInstance.ctx);
		//gameInstance.computer.draw(gameInstance.ctx);

		requestAnimationFrame(() => Game.gameLoop(gameInstance));
	}
	
	update(gameInstance: Game)
	{
		for (var i = 0; i < gameInstance.players.length; i++)
		{
			if (gameInstance.players[i].getKeysPressed()[KeyBindings.UP])
			{
				gameInstance.players[i].setvel(-1);
			}
			else if (gameInstance.players[i].getKeysPressed()[KeyBindings.DOWN])
			{
				gameInstance.players[i].setvel(1);
			}
			else
			{
				gameInstance.players[i].setvel(0);
			}
			gameInstance.players[i].move();
		}
		gameInstance.ball.update(gameInstance.players[0], gameInstance.players[1]);
		//gameInstance.computer.move(this.ball, this.gameCanvas);
	}

	updateGraphics()
	{  
		//this.ctx.fillStyle = "#000";
        //this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		
		//for (var i = 0; i <= this.gameCanvas.height; i += 30) {
		//	this.ctx.fillStyle = "red";
		//	this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
		//}

		//this.ctx.fillStyle = "red";
		//this.ctx.fillRect(20, Game.testnum, 10, 50);
		//Game.testnum
	}
}

class entity
{
	height: number;
	width: number;
	yPos: number;
	xPos: number;
	yVel: number = 0;
	xVel: number = 0;

	constructor(h:number, w:number, y:number, x:number)
	{
		this.height = h;
		this.width = w;
		this.yPos = y;
		this.xPos = x;
	}
	draw(ctx:CanvasRenderingContext2D)
	{
        ctx.fillStyle = "red";
        ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
	}

	getpos()
	{
		return [this.yPos, this.xPos];
	}
}

class ball extends entity
{
	private speed:number = 6;

	constructor(h:number, w:number, y:number, x:number)
	{
		super(h, w, y, x);
		var randomDirection = Math.floor(Math.random() * 2) + 1; 
        if(randomDirection % 2){
            this.xVel = 1;
        }else{
            this.xVel = -1;
        }
        randomDirection = Math.floor(Math.random() * 2) + 1; 
        if(randomDirection % 2){
            this.yVel = 1;
        }else{
            this.yVel = -1;
        }
	}

	update(player:player, player2:player)
	{
		if (this.yPos >= 580)
			this.yVel = -1;
		else if (this.yPos <= 0)
			this.yVel = 1;

		if (this.xPos <= player.xPos + player.width &&
			this.yPos + this.height >= player.yPos && 
			this.yPos <= player.yPos + player.height) 
		{
			this.xVel = 1;
		}

		if (this.xPos + this.width >= player2.xPos &&
			this.yPos + this.height >= player2.yPos && 
			this.yPos <= player2.yPos + player2.height) 
		{
			this.xVel = -1;
		}

		if (this.xPos <= 0)
			this.xPos = 400 - 10;
		else if (this.xPos >= 800)
			this.xPos = 400 - 10;

		this.xPos += this.xVel * this.speed;
		this.yPos += this.yVel * this.speed;
	}
}

class player extends entity
{
	private speed:number = 4;
	private keysPressed: { [key: string]: boolean } = {};
	
	constructor(h:number, w:number, y:number, x:number)
	{
		super(h, w, y, x);
	}

	setvel(velocityY:number)
	{
		this.yVel = velocityY;
	}

	move()
	{
		this.yPos += this.yVel * this.speed;
	}

	getKeysPressed()
	{
		return this.keysPressed;
	}

	setKeysPressed(keys: { [key: string]: boolean })
	{
		this.keysPressed = keys;
	}

}


class computer extends entity
{
	private speed:number = 4;
	
	constructor(h:number, w:number, y:number, x:number)
	{
		super(h, w, y, x);
	}

	setvel(velocityY:number)
	{
		this.yVel = velocityY;
	}

	move(ball:ball, canvas:HTMLCanvasElement)
	{
		if(ball.yPos < this.yPos && ball.xVel == 1){
            this.yVel = -1; 
            
            if(this.yPos <= 20){
                this.yVel = 0;
            }
       }
       else if(ball.yPos > this.yPos + this.height && ball.xVel == 1){
           this.yVel = 1;
           
           if(this.yPos + this.height >= canvas.height - 20){
               this.yVel = 0;
           }
       }
       else{
           this.yVel = 0;
       }
       
        this.yPos += this.yVel * this.speed;
	}
}


//const game = new Game();
//requestAnimationFrame(() => Game.gameLoop(game));