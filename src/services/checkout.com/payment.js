const fetch = require("node-fetch")
const { Checkout } = require("checkout-sdk-node")
const { CHECKOUT_COM_PUBLIC_KEY, CHECKOUT_COM_SECRET_KEY } = require("../../config")
const cko = new Checkout(CHECKOUT_COM_SECRET_KEY)

// const headers = {
//   "Content-Type": "application/json",
//   Authorization: CHECKOUT_COM_PUBLIC_KEY,
// }

/**
 * steps
 * 1. create context - for that link has mapping with CT keys (eg. request object)
 * 2. request for payments
 * ref: https://www.checkout.com/docs/previous/integrate/e-commerce-platforms/commercetools#Make_a_payment
 */

/**
 * This will do the api call to create context and return context_id in response
 * this context_id will use to make payment request
 */

// const apiCall = async ({ method, url, data }) => {
//   try {
//     const response = await fetch(url, {
//       method: method,
//       body: JSON.stringify(data),
//       headers: headers,
//     })
//     return await response.json()
//   } catch (error) {
//     return error
//   }
// }

// const requestPayment = async ({ method, url, data }) => {
//   try {
//     const response = await fetch(url, {
//       method: method,
//       body: JSON.stringify(data),
//       headers: headers,
//     })
//     return await response.json()
//   } catch (error) {
//     return error
//   }
// }

const getPaymentDetails = async ({ paymentId }) => {
  try {
    return await cko.payments.get(paymentId)
  } catch (error) {
    return error
  }
}

const capturePayment = async ({ paymentId, amount, reference, metadata }) => {
  try {
    return await cko.payments.capture(paymentId, {
      amount: amount,
      reference: reference,
      metadata: metadata,
    })
  } catch (error) {
    return error
  }
}

module.exports = {
  // apiCall,
  getPaymentDetails,
  capturePayment,
}
