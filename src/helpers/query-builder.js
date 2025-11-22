import db from "../config/db.js";


const schemas = {
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