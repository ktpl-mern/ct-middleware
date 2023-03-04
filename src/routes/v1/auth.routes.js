const { login, signup } = require("../../controllers/v1/auth.controller")

module.exports = function (app) {
  //API EndPoints
  app.post("/v1/login", login)
  app.post("/v1/signup", signup)
}
