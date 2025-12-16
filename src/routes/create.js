import { CreateQuery, schemas } from "../helpers/query-builder.js"
import db from "../config/db.js"
import { error, Errors } from "../helpers/errors.js"

export default function Creation(server, opts) {
  
  server.post('/api/create/:itemTable', { preHandler: server.authenticate }, async (req, rep) => {
    const { itemTable } = req.params
    const data = req.body

    await CreateQuery(itemTable, data, req.user)
    return rep.code(201).send({ message: `${itemTable} created succesfully` })
  })

  server.post('/api/add/to-folder/:itemTable/:folderId', { preHandler: server.authenticate }, async (req, rep) => {
    const table = req.params.itemTable
    const item_ids = req.body.itemIds
    const folder_id = Number(req.params.folderId)

    if (!schemas[table]) return error(rep, Errors.INVALID_DATA)
    if (!item_ids || !Array.isArray(item_ids)) return error(rep, Errors.INVALID_DATA)

    const placeholders = item_ids.map(() => '?, ?').join(', ')  
    const values = item_ids.flatMap(id => [id, folder_id])

    await db.raw(`insert into folder_item(${table}_id, folder_id) VALUES(${placeholders})`, values)
    return rep.code(201).send({ message: 'success' })
  })
  
}