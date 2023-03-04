const {
  fetchPaymentOptions,
  createPayment,
} = require("../controllers/checkout.controller")
const {
  placeOrder,
  updateAddress,
  getShippingMethodsForCartById,
  getPaymentById,
  updatePaymentById,
} = require("../controllers/order.controller")

module.exports = function (app) {
  //API EndPoints
  app.post("/me/checkout/placeOrder", placeOrder)
  app.put("/me/checkout/shippingAddress", updateAddress)
  app.get("/me/checkout/shippingMethods", getShippingMethodsForCartById)
  app.put("/me/checkout/billingAddress", updateAddress)
  app.post("/me/checkout/payments", fetchPaymentOptions)
  app.put("/me/checkout/payments", createPayment) // create new payment
  app.get("/me/checkout/payments/:id", getPaymentById)
  app.put("/me/checkout/payments/:id", updatePaymentById) // update existing payment
}
