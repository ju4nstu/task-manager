import { UpdateQuery}  from "../helpers/query-builder.js"

export default function Update(server, opts) {
  server.put('/api/update/:itemTable/:itemId', { preHandler: [server.authenticate] }, async (req, rep) => {
    const { itemTable, itemId } = req.params
    const data = req.body
 
    await UpdateQuery(itemTable, data, itemId, rep)
    return rep.code(201).send({ message: `item updated` })
  })
}