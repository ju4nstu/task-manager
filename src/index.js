import fastify from "fastify"
import db from './config/db.js'
import userRoutes from "./routes/users.js"
import fastifyJwt from "@fastify/jwt"
import fastifyCookie from "@fastify/cookie"

const server = fastify()

server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET_KEY
})

server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET_KEY
})

server.register(userRoutes)

server.listen({
  port: 4132
})
console.log('server listening on http://localhost:4132')