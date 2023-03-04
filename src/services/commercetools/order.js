const { apiRoot } = require("../ctClient")

const createOrder = async ({ body }) => {
  const response = await apiRoot
    .orders()
    .post({
      body: body,
    })
    .execute()
  return response
}

const updateOrderById = async ({ orderId, body }) => {
  const response = await apiRoot
    .orders()
    .withId({ ID: orderId })
    .post({
      body: body,
    })
    .execute()
  return response
}

const getShippingMethodsForCart = async ({ cartId }) => {
  const response = await apiRoot
    .shippingMethods()
    .matchingCart()
    .get({
      queryArgs: {
        cartId: cartId,
      },
    })
    .execute()
  return response
}

/**
 * get order list based on customer id
 * @param {string} customerId
 * @param {number} offset
 */
const getOrders = async ({ customerId, offset }) => {
  return apiRoot
    .orders()
    .get({
      queryArgs: {
        where: `customerId="${customerId}"`,
        offset,
        limit: 10,
      },
    })
    .execute()
}

/**
 * Get Order details based on order number
 * @param {string} orderNumber
 */
const getOrderDetailsByOrderNumber = async (orderNumber) => {
  return apiRoot
    .orders()
    .get({
      queryArgs: {
        where: `orderNumber="${orderNumber}"`,
      },
    })
    .execute()
}

module.exports = {
  createOrder,
  updateOrderById,
  getShippingMethodsForCart,
  getOrders,
  getOrderDetailsByOrderNumber,
}
