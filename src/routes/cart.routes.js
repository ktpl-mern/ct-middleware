const {
  getCartById,
  updateCartById,
  createCartDetails,
  applyDiscountCode,
  removeDiscountCode,
} = require("../controllers/cart.controller")

// const swaggerUi = require("swagger-ui-express")
// const swaggerFile = require("../swagger_output.json")

module.exports = function (app) {
  // app.get("/apidoc", swaggerUi.serve, swaggerUi.setup(swaggerFile))
  //API EndPoints

  app.get("/cart/:id", getCartById)

  app.post("/cart", createCartDetails)
  // this put api will do add , update , delete line items operations
  app.put("/cart/:id", updateCartById)
}
