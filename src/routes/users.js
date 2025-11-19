import db from '../config/db.js'
import bcrypt from 'bcrypt' 


export default async function userRoutes(server, opts) {
  server.post('/signup', async (req, rep) => {
    const data = req.body // name, email, password

    const user = await db.raw('select * from users where email = ?', [data.email])
    if (user.rows.length !== 0) return rep.code(409).send('user already exists')

    const password_hash = bcrypt.hashSync(data.password, 12)
    await db.raw('insert into users(name, email, password) values (?, ?, ?)', [data.name, data.email, password_hash])
  
    return rep.code(201).send('user created')
  })

  server.post('/signin', async (req, rep) => {
    const data = req.body

    const user = await db.raw('select password, name, id from users where email = ?', [data.email])
  
    if (user.rows.length === 0) return rep.code(401).send('wrong credentials')
    if (!bcrypt.compareSync(data.password, user.rows[0].password)) return rep.code(401).send('wrong credentials')
    
    const payload = { id: user.rows[0].id, name: user.rows[0].name }
    const token = server.jwt.sign(payload, { expiresIn: '10h' })

    rep.setCookie('token', token, {
      path: '/',
      secure: false,
      httpOnly: true
    }).code(200)

    return rep.code(200).send({ token: token, message: 'user logged in' })
  })

  server.get('/profile', { preHandler: server.authenticate }, async (req, rep) => {
    const data = req.user // name, email, bio
    const user = await db.raw('select name, email, bio from users where id = ?', [data.id])
    // the user's profile containing profile picture, name, email, option to change password, his latest/favorite tasks and notes

    const tasks = await db.raw('SELECT t.name, t.description, t.status FROM tasks AS t INNER JOIN user_task AS UT on t.id = ut.task_id where ut.user_id = ?', [data.id])
    const notes = await db.raw('SELECT n.name, n.description FROM notes AS n INNER JOIN user_note AS un ON n.id = un.note_id where un.user_id = ?', [data.id])

    rep.code(200).send({ user: user.rows, tasks: tasks.rows, notes: notes.rows })
    // i have name, id and email

  })
}