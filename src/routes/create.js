import { CreateQuery, schemas } from "../helpers/query-builder.js"
import db from "../config/db.js"
import { error, Errors } from "../helpers/errors.js"
import { IntoACL } from "../helpers/query-builder.js"
import { UpdateACL } from "../helpers/query-builder.js"
import { CheckOwnership } from "../helpers/query-builder.js"

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
  
  server.post('/api/add/:user/:item/:itemid', { preHandler: server.authenticate }, async (req, rep) => {
    await CheckOwnership(req.params, req.user)
    await IntoACL(req.params, req.body)
    return rep.code(201).send({ message: "user added" })
  })
  
  server.post('/api/update/:user/:item/:itemid', { preHandler: server.authenticate }, async (req, rep) => {
    await CheckOwnership(req.params, req.user, rep)
    await UpdateACL(req.params, req.body)
    return rep.code(201).send({ message: "user update" })
  })

}