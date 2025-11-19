import db from "../config/db.js"

export default function Update(server, opts) {
  async function validateTask(req, rep) {
    const tasks = await db.raw('select * from user_task where user_id = ? and task_id = ?', [req.user.id, req.params.taskId])    
    
    if (tasks.rows.length === 0) throw rep.httpErros.unauthorized
  }

  async function validateNote(req, rep) {
    const tasks = await db.raw('select * from user_note where user_id = ? and note_id = ?', [req.user.id, req.params.noteId])
    
    if (tasks.rows.length === 0) throw rep.httpErros.unauthorized
  }
  
  async function sqlQuery(table, data, elementID) {
    let clauses = []
    let values = []
    let returning = []

    if (data.name !== undefined) {
      clauses.push("name = ?")
      values.push(data.name)
      returning.push("name")
    }
    
    if (data.description !== undefined) {
      clauses.push("description = ?")
      values.push(data.description)
      returning.push("description")
    }
    
    if (data.status !== undefined) {
      clauses.push("status = ?")
      values.push(data.status)
      returning.push("status")
    }

    return await db.raw(`update ${table} set ${clauses.join(', ')} where id = ? returning ${returning.join(', ')}`, [...values, elementID]) // spread operator ... transforma arrays em elementos individuais
  }
  
  
  server.put('/task/update/:taskId', { preHandler: [server.authenticate, validateTask] }, async (req, rep) => {
    let table = 'tasks'
    const data = req.body
    const taskID = req.params.taskId
    const before = await db.raw('select name, description, status from tasks where id = ?', [taskID])
    
    const result = await sqlQuery(table, data, taskID)
    
    return rep.code(201).send({ message: `table ${table} updated`, before: before.rows[0], after: result.rows[0] })
  })
  
  
  server.put('/note/update/:noteId', { preHandler: [server.authenticate, validateNote] }, async (req, rep) => {
    let table = 'notes'
    const data = req.body
    const noteID = req.params.noteId
    const before = await db.raw('select name, description from notes where id = ?', [noteID])

    await sqlQuery(table, data, noteID)

    const after = await db.raw('select name, description from notes where id = ?', [noteID])
    rep.code(201).send({ message: `table ${table} updated`, before: before.rows[0], after: after.rows[0] })
  })
}