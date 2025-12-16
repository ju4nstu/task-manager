import db from "../config/db.js"
import { error, Errors } from "../helpers/errors.js"

const schema = ['task', 'note']
export default async function Favorite(server, opts) {  
  server.put('/api/add/favorite/:itemType/:itemId', { preHandler: server.authenticate }, async (req, rep) => {
    const { itemType, itemId } = req.params

    if (!schema.includes(itemType)) return error(rep, Errors.INVALID_DATA)
    
    await db.raw(`INSERT INTO favorites(${itemType}_id, user_id) VALUES (?, ?)`, [itemId, req.user.id])
    return rep.code(201).send({ message: `${itemType} added in favorites list!` })
  })
}