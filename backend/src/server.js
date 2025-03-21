import dotenv from "dotenv"
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import path from 'path'
import { fileURLToPath } from 'url';
import { Server } from "socket.io";
import cookie from '@fastify/cookie'
import formbody from '@fastify/formbody'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'

dotenv.config();

// import cors from '@fastify/cors';
// // Some CORS stuff
// await fastify.register(cors, {
// 	origin: true,           // Or explicitly set your frontend URL
// 	credentials: true,      // Allow cookies to be sent with requests
// });

// Correctly resolve __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Path to frontend output
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');

const fastify = Fastify({
  // logger: true
})

const server = fastify.server;
const games = {};
const rooms = {};

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

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});

	socket.on("joinRoom", (roomId) => {
		if (!rooms[roomId]) {
			rooms[roomId] = {
				players: {},
				peerConnections: {}
			};
		}

		// Add the player to the room
		if (Object.keys(rooms[roomId].players).length <= 1) {
			rooms[roomId].players[socket.id] = {
				playerPosition: { x: 0, y: 0 },
				dataChannel: null
			};

			socket.join(roomId);
			console.log(`${socket.id} joined room ${roomId}`);
		}

		console.log("Players in room:", Object.keys(rooms[roomId].players).length );

		console.log("Host: ", Object.keys(rooms[roomId].players)[0]);

		if (Object.keys(rooms[roomId].players).length  == 2)
			io.to(roomId).emit("startGame", roomId, Object.keys(rooms[roomId].players)[0]);
	});

	socket.on('offer', (offer) => {

		socket.broadcast.emit('offer', offer);

	});


	socket.on('answer', (answer) => {

		socket.broadcast.emit('answer', answer);

	});


	socket.on('ice-candidate', (candidate) => {
		console.log("ice-candidate", candidate);
		socket.broadcast.emit('ice-candidate', candidate);

	});
});

// Serve frontend files
fastify.register(fastifyStatic, {
    root: FRONTEND_DIST,
    prefix: '/',
});

// Serve avatars
fastify.register(fastifyStatic, {
    root: path.join(__dirname, './avatars'),
    prefix: '/avatars/',
    decorateReply: false,
});

fastify.register(jwt, {
    secret: process.env.ACCESS_TOKEN_SECRET,
});

fastify.setNotFoundHandler((req, reply) => {
    reply.sendFile('index.html', { root: FRONTEND_DIST });
});

await fastify.register(dbInit)
fastify.register(formbody)
fastify.register(cookie)
fastify.register(multipart)
await fastify.register(root)
await fastify.register(userRoutes)

fastify.listen({ port: process.env.PORT, host: process.env.HOST }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
	console.log(`Server listening at ${address}`)
});