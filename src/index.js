import fastify from "fastify"
import db from './config/db.js'
import fastifyJwt from "@fastify/jwt"
import fastifyCookie from "@fastify/cookie"
import fastifySensible from "@fastify/sensible"

import Authentication from "./routes/authentication.js"
import userRoutes from "./routes/users.js"
import Creation from "./routes/create.js"
import Update from "./routes/update.js"

const server = fastify()

server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET_KEY
})

server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET_KEY
})
server.register(fastifySensible)

server.register(Authentication)
server.register(userRoutes)
server.register(Creation)
server.register(Update)


server.listen({
  port: 4132
})
console.log('server listening on http://localhost:4132')