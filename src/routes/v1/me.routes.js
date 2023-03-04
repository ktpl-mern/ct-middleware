const { getCartById, updateCartById } = require("../../controllers/v1/me.controller")

module.exports = function (app) {
  //Logged in Customer cart releated api end point
  app.get("/v1/me/cart/:id", getCartById)
  // this put api will do add , update , delete line items operations
  app.put("/v1/me/cart/:id", updateCartById)
}
