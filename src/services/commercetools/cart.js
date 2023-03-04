const { apiRoot } = require("../ctClient")

const cartById = async ({ cartId }) => {
  const response = await apiRoot.carts().withId({ ID: cartId }).get({
    queryArgs: {
      expand: "discountCodes[*].discountCode"
    }
  }).execute()
  return response
}

const cartByCustomerId = async ({ customerId }) => {
  const response = await apiRoot.carts().withCustomerId({ customerId }).get().execute()
  return response
}

const createCart = async ({ body }) => {
  const response = await apiRoot
    .carts()
    .post({
      body: body,
    })
    .execute()
  return response
}

const updateCart = async ({ cartId, body }) => {
  return await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({
      body: body,
    })
    .execute()
}


module.exports = {
  cartById,
  createCart,
  updateCart,
  cartByCustomerId,

}
