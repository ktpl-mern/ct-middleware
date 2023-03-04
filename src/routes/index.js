const { authMiddleware } = require("../middleware/auth.middleware")

module.exports = function (app) {
  //Routes without token verification
  require("./contentful.routes")(app)
  require("./catelog.routes")(app)
  require("./v1/catelog.routes")(app)
  require("./auth.routes")(app)
  require("./v1/auth.routes")(app)
  require("./cart.routes")(app)
  require("./v1/cart.routes")(app)
  require("./discount.routes")(app)
  require("./project.routes")(app)

  require("./customer.routes")(app)
  require("./checkout.routes")(app)
  //Routes with token verification
  app.use(authMiddleware)
  require("./customerCheckout.routes")(app)
  require("./me.routes")(app)
  require("./v1/me.routes")(app)
  require("./review.routes")(app)
}
