const { login, signup, logout, mobileOtpGenerate } = require("../controllers/auth.controller")

module.exports = function (app) {
  //API EndPoints
  app.post("/login", login)
  app.post("/signup", signup)
  app.post("/mobile/otp", mobileOtpGenerate)
}
