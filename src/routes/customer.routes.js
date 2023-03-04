const {
  isCustomerExist,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/customer.controller")
const { authMiddleware } = require("../middleware/auth.middleware")

module.exports = function (app) {
  //API EndPoints
  app.post("/customer/exist", isCustomerExist)
  app.post("/forgotPassword", forgotPassword)
  app.post("/resetPassword", resetPassword)
  app.delete("/logout", logout)
}
