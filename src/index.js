import fastify from "fastify"
import db from './config/db.js'
import fastifyJwt from "@fastify/jwt"
import fastifyCookie from "@fastify/cookie"
import fastifySensible from "@fastify/sensible"

import Authentication from "./helpers/authentication.js"
//import Validate from "./helpers/validate.js"
import userRoutes from "./routes/users.js"
import Creation from "./routes/create.js"
import Update from "./routes/update.js"
import Delete from "./routes/delete.js"
import Favorite from "./routes/favorites.js"


const server = fastify()

server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET_KEY
})

server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET_KEY
})
server.register(fastifySensible)

server.register(Authentication)
//server.register(Validate)
server.register(userRoutes)
server.register(Creation)
server.register(Update)
server.register(Delete)
server.register(Favorite)


server.listen({
  port: 4132
})
console.log('server listening on http://localhost:4132')