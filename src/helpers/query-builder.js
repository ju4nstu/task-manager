import db from "../config/db.js";
import { error, Errors } from "./errors.js";

export const schemas = {
  task: ['name', 'description', 'status'],
  note: ['name', 'description'],
  folder: ['name', 'parent_id'],
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

  console.log(`INSERT INTO ${table}s(${column.join(', ')}) VALUES (${placeholder}) returning id`)
  const insert = await db.raw(`INSERT INTO ${table}s(${column.join(', ')}) VALUES (${placeholder}) returning id`, [values])
  const returned_id = insert.rows[0].id
  await db.raw(`INSERT INTO user_${table}(user_id, ${table}_id) VALUES (?, ?)`, [user.id, returned_id])
  
}

export async function IntoFolder() {
  const table = req.params.itemTable
  const item_ids = req.body
  const folder_id = req.params.folderId
    
  if (!schemas[table]) return error(rep, Errors.INVALID_DATA)
  if (!item_ids || !Array.isArray(item_ids)) return error(rep, Errors.INVALID_DATA)

  const placeholders = item_ids.map(() => '(?, ?)').join(', ')  
  const values = item_ids.flatMap(id => [id, folder_id])
  console.log(values)
  //await db.raw(`insert into folder_item(${table}_id, folder_id) VALUES (?, ?)`, values)
}