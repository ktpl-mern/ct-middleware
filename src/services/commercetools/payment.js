const { apiRoot } = require("../ctClient")

/**
 * it will create new payment with info amount planned
 * payment method with its transaction
 */
const createPayment = async (body) => {
  const reqData = {
    amountPlanned: {
      currencyCode: body.payment_option.currency,
      centAmount: body.payment_option.amount,
    },
    paymentMethodInfo: {
      method: body.payment_option.method,
      name: {
        en: body.payment_option.name,
      },
    },
    transactions: [
      {
        timestamp: new Date().toISOString(),
        type: "Charge",
        amount: {
          currencyCode: body.payment_option.currency,
          centAmount: 1000,
        },
        state: "Pending",
      },
    ],
  }
  return await apiRoot
    .payments()
    .post({
      body: reqData,
    })
    .execute()
}

const getPaymentById = async ({ paymentId }) => {
  const response = await apiRoot.payments().withId({ ID: paymentId }).get().execute()
  return response
}

const updatePaymentById = async ({ paymentId, body }) => {
  const response = await apiRoot
    .payments()
    .withId({ ID: paymentId })
    .post({
      body: body,
    })
    .execute()
  return response
}

module.exports = {
  createPayment,
  getPaymentById,
  updatePaymentById,
}
