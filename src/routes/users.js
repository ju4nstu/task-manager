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
    const token = server.jwt.sign(payload, { expiresIn: '1h' })

    rep.setCookie('token', token, {
      path: '/',
      secure: false,
      httpOnly: true
    }).code(200).send('cookie sent')

    return rep.code(200).send('user logged in')
  })
}