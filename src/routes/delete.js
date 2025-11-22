import db from "../config/db.js"
import { error, Errors } from '../helpers/errors.js'

const schemas = ['note', 'task', 'folder']

export default async function Delete(server, opts) {
  server.delete('/delete/:itemTable/:itemId', { preHandler: server.authenticate }, async (req, rep) => {
    if (!schemas.includes(req.params.itemTable)) return error(rep, Errors.INVALID_DATA)

    const delete_item = await db.raw(`delete from ${req.params.itemTable}s * where id = ? returning id`, [req.params.itemId])
    if (delete_item.rows[0] === undefined) return error(rep, Errors.ITEM_NOT_FOUND)
    
    return rep.code(200).send({ message: "note deleted succesfully" })
  })
}