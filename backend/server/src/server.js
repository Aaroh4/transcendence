import dotenv from "dotenv"
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes, friendRoutes, tournamentRoutes } from './routes/routes.js'
import dbInit from './database.js'
import path from 'path'
import cookie from '@fastify/cookie'
import formbody from '@fastify/formbody'
import ejs from 'ejs'
import view from '@fastify/view'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { fileURLToPath } from 'url';
import { setupNetworking } from './networking.js';
import { Logger, LogLevel } from './utils/logger.js';
import { promises as fs } from 'fs'


// Compute __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIST = path.resolve(__dirname, '../../../frontend/dist');

const log = new Logger(LogLevel.INFO);

log.info("Creating server")
log.info("DIST:::: " + FRONTEND_DIST);

dotenv.config({ path: "../.env" });

const key = await fs.readFile(path.join('../../nginx', 'localhost.key'));
const cert = await fs.readFile(path.join('../../nginx', 'localhost.crt'));

const fastify = Fastify({
	logger: true,
	https: {
	key,
	cert
	}
})

fastify.register(view, {
  engine: {
    ejs: ejs,
  },
})

// fastify.setTrustProxy(true); for web reverse proxy

const server = fastify.server;
setupNetworking(server);

// Serve frontend files
fastify.register(fastifyStatic, {
    root: FRONTEND_DIST,
    prefix: '/',
});

// Serve avatars
fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/public/',
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
fastify.register(root)
fastify.register(userRoutes)
fastify.register(friendRoutes)
fastify.register(tournamentRoutes)

await fastify.listen({ port: process.env.PORT || 5001, host: process.env.HOST || '0.0.0.0' }, function (err, address) {
	log.info('Listening on port', process.env.PORT);
	if (err) {
		log.info('Error: ', err)
		fastify.log.error(err)
		process.exit(1)
	}
	log.info(`Server listening at ${address}`)
})