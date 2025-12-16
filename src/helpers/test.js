import db from "../config/db.js"

try {
  const trx = await db.transaction()
  await trx.raw(`SET LOCAL app.current_user_id = '99ced19c-be23-40ce-9042-4ac16a7b0120'`)
  const data = await trx('notes').select('*')
  console.log(await trx.raw("SELECT name FROM pg_settings WHERE name = 'app.current_user_id'"))
      
  await trx.commit()
  console.log('data: ', data)
} catch (err) {
  console.log(err)
}