import { CreateQuery } from "../helpers/query-builder.js"

export default function Creation(server, opts) {
  
  server.post('/create/:itemTable', { preHandler: server.authenticate }, async (req, rep) => {
    const { itemTable } = req.params
    const data = req.body

    await CreateQuery(itemTable, data, req.user)
    return rep.code(201).send({ message: `${itemTable} created succesfully` })
  })
  
}