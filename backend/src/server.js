import dotenv from "dotenv"
dotenv.config();
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import path from 'path'
import cookie from '@fastify/cookie'
import formbody from '@fastify/formbody'
import ejs from 'ejs'
import view from '@fastify/view'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { fileURLToPath } from 'url';
import { Server } from "socket.io";
import { Game } from '../dist/game.js'


// Compute __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
	//logger: true
})
const server = fastify.server;
let game = [];

await fastify.register(dbInit)
fastify.register(formbody)
fastify.register(cookie)
fastify.register(multipart)
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), '../public'),
  prefix: '/',
})
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), "../avatars"),
  prefix: "/avatars/",
  decorateReply: false,
});
fastify.register(jwt, {
  secret: process.env.ACCESS_TOKEN_SECRET,
})
fastify.register(view, {
  engine: {
    ejs: ejs,
  },
})

function gameLoop(room) {
	io.to(room).emit("updateGame", game[room].getPos());
	
	setTimeout(() => gameLoop(room), 1000 / 60);
}

const io = new Server(server, {
	cors: {
	  origin: "*", // Change to frontend URL whenever needed
	  methods: ["GET", "POST"],
	  allowedHeaders: ["Content-Type"],
	  credentials: true
	},
  });

  io.on("connection", (socket) => {  
	console.log("A user connected:", socket.id);

	socket.on("joinRoom", (room) => {
		const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
		console.log(roomSize);
		if (!socket.rooms.has(room) || roomSize != 1)
		{
			socket.join(room);
			console.log(`User ${socket.id} joined room: ${room}`);
			io.to(room).emit("message", `User ${socket.id} has joined ${room}`);
			if (roomSize == 1)
			{
				console.log("Starting game!");
				io.to(room).emit("startGame");
				const playerIds = Array.from(io.sockets.adapter.rooms.get(room) || []);
				game[room] = new Game(playerIds[0], playerIds[1]);
				gameLoop(room);
			}
		}
		else if(roomSize == 2)
		{
			console.log(`Room ${room} is already full!`);
		}
		else
		{
			console.log(`User ${socket.id} is already in a room!`);
		}

	  });
	
	socket.on("disconnect", () => {
	  console.log("User disconnected:", socket.id);
	});

	socket.on("keysPressed", (e) => {
		const room = Array.from(socket.rooms)[1];
		if (game[room] == undefined)
		{
			console.log("Game not started yet!");
			return;
		}
			
		game[room].keyDown(e, socket.id);
		//game.update(game);
		io.to(room).emit("updateGame", game[room].getPos());
		console.log(game[room].getPos());
	});


	// temporary code
    socket.on('offer', (offer) => {
        console.log('Offer received:', offer);
        socket.to(Array.from(socket.rooms)[1]).emit('offer', offer);
    });

    // Listen for the answer from the remote peer
    socket.on('answer', (answer) => {
        console.log('Answer received:', answer);
        socket.to(Array.from(socket.rooms)[1]).emit('answer', answer);
    });

    // Listen for ICE candidates
    socket.on('iceCandidate', (candidate) => {
        console.log('ICE Candidate received:', candidate);
        // Broadcast ICE candidate to all peers
        socket.to(Array.from(socket.rooms)[1]).emit('iceCandidate', candidate);
    });

  });

	// Serve static files from the public directory
	// Adjust the relative paths based on the location of this file
	fastify.register(fastifyStatic, {
		root: path.join(__dirname, '../../public'), // e.g., if this file is in backend/src, resolves to /app/public
		prefix: '/',
		decorateReply: true
	});
		
	// Serve static files from the dist directory
	fastify.register(fastifyStatic, {
		root: path.join(__dirname, '../dist'), // e.g., resolves to /app/backend/dist
		prefix: '/dist/',
		decorateReply: false 
	});

//await fastify.register(dbInit)
await fastify.register(root)
await fastify.register(userRoutes)

// fastify.listen({ port: process.env.PORT || 5000}, function (err, address) {
//   if (err) {
//     fastify.log.error(err)
//     process.exit(1)
//   }
//   console.log(`Server listening at ${address}`)
// })

// For Docker to work:
fastify.listen({ 
	port: process.env.PORT || 5000, 
	host: '0.0.0.0' 
  }, function (err, address) {
	if (err) {
	  fastify.log.error(err)
	  process.exit(1)
	}
	console.log(`Server listening at ${address}`)
  })