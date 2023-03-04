const {
  createPayment,
  fetchPaymentOptions,
} = require("../controllers/checkout.controller")
const { paypalInitialized } = require("../controllers/checkout.com.controller")
const {
  placeOrder,
  updateAddress,
  getShippingMethodsForCartById,
  getPaymentById,
  updatePaymentById,
} = require("../controllers/order.controller")

const { createContext, makePayment } = require("../controllers/checkout.com.controller")

module.exports = function (app) {
  //API EndPoints
  app.post("/checkout/placeOrder", placeOrder)
  app.put("/checkout/shippingAddress", updateAddress)
  app.get("/checkout/shippingMethods", getShippingMethodsForCartById)
  app.put("/checkout/billingAddress", updateAddress)
  app.post("/checkout/payments", fetchPaymentOptions)
  app.get("/checkout/payment/:id", getPaymentById)
  app.put("/checkout/payment/:id", updatePaymentById)
  app.post("/checkout/paypal/init", paypalInitialized)
  //Checkout.com Payment API's
  app.post("/payment/createContext", createContext)
  app.post("/payment/requestPayment", makePayment)
  app.get("/checkout/payments/:id", getPaymentById)
  app.put("/checkout/payments", createPayment) // create new payment
  app.put("/checkout/payments/:id", updatePaymentById) // update existing payment
}
