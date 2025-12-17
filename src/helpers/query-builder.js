import db from "../config/db.js";
import { error, Errors } from "./errors.js";

export const schemas = {
  task: ['name', 'description', 'status', 'visibility'],
  note: ['name', 'description', 'visibility'],
  folder: ['name', 'parent_id', 'visibility'],
}


export async function UpdateQuery(table, data, elementID, rep) {

  if(!schemas[table]) return rep.code(400).send({ message: "invalid input" })
  
  const clauses = []
  const values = []
  const allowed_columns = schemas[table]

  for (const col of allowed_columns) {
    if (data[col] !== undefined) {
      clauses.push(`${col} = ?`)
      values.push(data[col])
    }
  }

  if (clauses.length === 0) return rep.code(400).send({ message: "no data provided" })

  const update = await db.raw(`UPDATE ${table}s SET ${clauses.join(', ')} where id = ? returning id`, [...values, elementID] )
  if (update.rows[0] === undefined) return rep.code(400).send({ message: "item does not exist" })
}


export async function CreateQuery(table, data, user) {
  if (!schemas[table]) return rep.code(400).send({ message: "invalid input" })
    
    const column = []
    const allowed_columns = schemas[table]
    const values = []
    
    for (const col of allowed_columns) {
      if (data[col] !== undefined) {
        column.push(col)
        values.push(data[col])
      }
  }
  
  if (column.length === 0) return rep.code(400).send({ message: "no data provided" })

  const placeholder = column.map(() => '?').join(', ')

  // console.log(`INSERT INTO ${table}s(${column.join(', ')}) VALUES (${placeholder}) returning id`)
  // console.log([...values])
  const insert = await db.raw(`INSERT INTO ${table}s(${column.join(', ')}) VALUES (${placeholder}) returning id`, [...values])
  const returned_id = insert.rows[0].id
  await db.raw(`INSERT INTO user_${table}(user_id, ${table}_id) VALUES (?, ?)`, [user.id, returned_id])
  await db.raw(`INSERT INTO access_ctrl_list(${table}_id, user_id, role) VALUES (?, ?, ?)`, [returned_id, user.id, 'owner'])
  
}

export async function IntoFolder() {
  const table = req.params.itemTable
  const item_ids = req.body
  const folder_id = req.params.folderId
    
  if (!schemas[table]) return error(rep, Errors.INVALID_DATA)
  if (!item_ids || !Array.isArray(item_ids)) return error(rep, Errors.INVALID_DATA)

  const placeholders = item_ids.map(() => '(?, ?)').join(', ')  
  const values = item_ids.flatMap(id => [id, folder_id])
  //await db.raw(`insert into folder_item(${table}_id, folder_id) VALUES (?, ?)`, values)
}

export async function IntoACL(table, data) {
  await db.raw(`INSERT INTO access_ctrl_list(${table.item}_id, user_id, role) VALUES (?, ?, ?)`, [table.itemid, table.user, data.role])
}

export async function UpdateACL(table, data) {
  await db.raw(`UPDATE access_ctrl_list SET role = ? WHERE ${table.item}_id = ? AND user_id = ?`, [data.role, table.itemid, table.user])
}

export async function CheckOwnership(table, user, rep) {
  // preciso ver se o usuario é dono dessa task em especifico
  const q = await db.raw(`SELECT role FROM access_ctrl_list WHERE user_id = ? AND ${table.item}_id = ?`, [user.id, table.itemid])
  console.log(q.rows[0])
  if (q.length === 0) return rep.code(401).send({ message: 'unauthorized' })
  if (q.rows[0].role !== 'owner') return rep.code(401).send({ message: 'unauthorized' })
}