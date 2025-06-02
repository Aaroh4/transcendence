import dotenv from "dotenv"
import Fastify from 'fastify'
import loginRoutes from './routes/authRoutes.js'
import dbInit from '../server/src/database.js'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: "../.env" });

const fastify = Fastify({
  logger: true,
	https: {
    key: fs.readFileSync(path.join('../../nginx', 'localhost.key')),
    cert: fs.readFileSync(path.join('../../nginx', 'localhost.crt'))
  }
})

await fastify.register(dbInit)
await fastify.register(cors, {
    origin: [`https://${process.env.HOST_LAN_IP}:${process.env.PORT}`, 'http://localhost:5173', 
		'https://localhost:5001'],

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

await fastify.register(jwt, {
secret: process.env.ACCESS_TOKEN_SECRET,
})

await fastify.register(loginRoutes)


await fastify.listen({ port: process.env.AUTH_PORT || 4000, host: process.env.HOST || '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`authServer listening at ${address}`)
})
