import db from '../config/db.js'
import bcrypt from 'bcrypt' 


export default async function userRoutes(server, opts) {
  server.post('/api/signup', async (req, rep) => {
    const data = req.body // name, email, password

    const user = await db.raw('select * from users where email = ?', [data.email])

    if (user.rows.length !== 0) return rep.code(409).send('user already exists')

    const password_hash = bcrypt.hashSync(data.password, 12)
    await db.raw('insert into users(name, email, password) values (?, ?, ?)', [data.name, data.email, password_hash])
  
    return rep.code(201).send('user created')
  })

  server.post('/api/signin', async (req, rep) => {
    const data = req.body
    const user = await db.raw('select password, name, id from users where email = ?', [data.email])
  
    if (user.rows.length === 0) return rep.code(401).send('wrong credentials')
    if (!bcrypt.compareSync(data.password, user.rows[0].password)) return rep.code(401).send('wrong credentials')
    
    const payload = { id: user.rows[0].id, name: user.rows[0].name }
    const token = server.jwt.sign(payload, { expiresIn: '100h' })

    rep.setCookie('token', token, {
      path: '/',
      secure: false,
      httpOnly: true
    }).code(200)

    return rep.code(200).send({ token: token, message: 'user logged in' })
  })

  server.get('/api/profile', { preHandler: server.authenticate }, async (req, rep) => {
    const data = req.user // name, email, bio
    const user = await db.raw('select name, email, bio from users where id = ?', [data.id])
    // the user's profile containing profile picture, name, email, option to change password, his latest/favorite tasks and notes

    const tasks = await db.raw(`
      SELECT t.id, t.name, t.description, t.status FROM tasks AS t 
      INNER JOIN user_task AS UT on t.id = ut.task_id where ut.user_id = ? ORDER BY t.created_at DESC
      `, [data.id])
    
    const notes = await db.raw(`
      SELECT n.id, n.name, n.description FROM notes AS n 
      INNER JOIN user_note AS un ON n.id = un.note_id where un.user_id = ? ORDER BY n.created_at DESC
      `, [data.id])
    
    const folders = await db.raw(`
      SELECT f.id, f.name, f.parent_id FROM folders AS f 
      INNER JOIN user_folder AS uf ON f.id = uf.folder_id where uf.user_id = ?
      `, [data.id])
    
    const favorites = await db.raw(`
      SELECT t.id, t.name, t.description, t.status, 'task' AS type FROM tasks AS t
      INNER JOIN favorites AS fv ON t.id = fv.task_id WHERE fv.user_id = ?
      
      UNION ALL

      SELECT n.id, n.name, n.description, NULL AS status, 'note' AS type FROM notes AS n
      INNER JOIN favorites AS fv ON n.id = fv.note_id WHERE fv.user_id = ? 
      
    `, [data.id, data.id])
    rep.code(200).send({ user: user.rows, tasks: tasks.rows, notes: notes.rows, folders: folders.rows, favorites: favorites.rows })
  })

  server.get('/profile', (req, rep) => {
    rep.sendFile('profile.html')
  })

  server.get('/dashboard', (req, rep) => {
    // this page will show all public notes in the website
    // will work for a very simple application like this, but will need pagination for scalability
    // might add filters
  })

  server.get("/dashboard/notes", async (req, rep) => {
    const q = await db.raw(`
      SELECT n.id, n.name, n.description, n.visibility, 
      u.name AS user_name,
      u.id AS user_id
      FROM notes n
      JOIN user_note un ON un.note_id = n.id
      JOIN users u ON u.id = un.user_id
      WHERE n.visibility = 'public'
    `)
    return rep.code(200).send({ content: q.rows })
  })

  server.get('/dashboard/tasks', async (req, rep) => {
    const q = await db.raw(`
      SELECT t.id, t.name, t.description, t.status, t.visibility,
      u.name AS user_name,
      u.id AS user_id
      FROM tasks t
      JOIN user_task ut ON ut.task_id = t.id
      JOIN users u ON u.id = ut.user_id
      WHERE t.visibility = 'public' 
    `)
    return rep.code(200).send({ content: q.rows })
  })

}