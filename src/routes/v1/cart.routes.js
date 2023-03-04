const { getCartById, updateCartById } = require("../../controllers/v1/cart.controller")

module.exports = function (app) {
  //API EndPoints
  app.get("/v1/cart/:id", getCartById)
  // this put api will do add , update , delete line items operations
  app.put("/v1/cart/:id", updateCartById)
}
