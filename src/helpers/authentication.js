import fp from 'fastify-plugin'
import db from "../config/db.js"
import { error, Errors } from "./errors.js"

export default fp (async function Authentication(server, opts) {
  server.decorate('authenticate', async (req, rep) => {
    try {
      await req.jwtVerify()
    } catch (error) {
      rep.send(error)
    }
  })
  server.decorate('current_user', async (req, rep) => {
    try {
      await db.raw('BEGIN')
      await db.raw('SET LOCAL app.current_user_id = ?', [req.user.id])
      
    } catch (err) {
        return 'error'
    }
  })
})