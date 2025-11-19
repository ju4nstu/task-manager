import db from "../config/db.js"

export default function Creation(server, opts) {
  server.post('/task/create', { preHandler: server.authenticate }, async (req, rep) => {
    // req -> task name; task description; task status
    const user = req.user
    const data = req.body
    
    const insert_task = await db.raw('insert into tasks(name, description, status) values (?, ?, ?) returning id', [data.name, data.description, data.status])
    const task_id = insert_task.rows[0].id
    const insert_junction = await db.raw('insert into user_task(user_id, task_id) values (?, ?)', [user.id, task_id])
  
    rep.code(201).send({ message: 'task created', name: data.name, desc: data.description, status: data.status })
  }) 

  server.post('/note/create', { preHandler: server.authenticate }, async (req, rep) => {
    // req -> note name, note description
    const user = req.user
    const data = req.body

    const insert_note = await db.raw('insert into notes(name, description) values (?, ?) returning id', [data.name, data.description])
    const note_id = insert_note.rows[0].id
    const insert_junction = await db.raw('insert into user_note(user_id, note_id) values (?, ?)', [user.id, note_id])
  
    rep.code(201).send({ message: 'note created', name: data.name, desc: data.description })
  })
}