import fp from 'fastify-plugin'

export default fp (async function Authentication(server, opts) {
  server.decorate('authenticate', async (req, rep) => {
    try {
      await req.jwtVerify()
    } catch (error) {
      rep.send(error)
    }
  })
})