import fastify from "fastify"
import db from './config/db.js'
import fastifyJwt from "@fastify/jwt"
import fastifyCors from "@fastify/cors"
import fastifyCookie from "@fastify/cookie"
import fastifyStatic from "@fastify/static"
import fastifySensible from "@fastify/sensible"

import path from "path"
import {dirname} from "path"
import { fileURLToPath } from "url"

import Authentication from "./helpers/authentication.js"
import userRoutes from "./routes/users.js"
import Creation from "./routes/create.js"
import Update from "./routes/update.js"
import Delete from "./routes/delete.js"
import Favorite from "./routes/favorites.js"


const server = fastify()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET_KEY,
  cookie: {
    cookieName: 'token'
  }
})
server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET_KEY
})
server.register(fastifySensible)
server.register(fastifyStatic, {
  root: path.join(__dirname, '../public')
})
server.register(fastifyCors, {
  origin: "*",
  credentials: true
})

server.register(Authentication)
server.register(userRoutes)
server.register(Creation)
server.register(Update)
server.register(Delete)
server.register(Favorite)


server.listen({
  port: 4132
})
console.log('server listening on http://localhost:4132')