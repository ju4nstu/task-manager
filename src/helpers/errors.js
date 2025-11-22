export const error = (rep, err) => {
  return rep.code(err.status).send({ message: err.message })
}

export const Errors = { 
  ITEM_NOT_FOUND: { status: 400, message: "item does not exist" },
  INVALID_DATA: { status: 422, message: "invalid data" },
}
