const apicache = require("apicache")
const { redisClient } = require("../services")
const { API_CACHE_EXPIRATION } = require("../config")
let cacheWithRedis = apicache.options(redisClient).middleware
const megamenu = require("../controllers/megamenu.controller")
const home = require("../controllers/home.controller")
const footer = require("../controllers/footer.controller")

module.exports = function (app) {
  //API Endpoints
  app.get("/megamenu", cacheWithRedis(API_CACHE_EXPIRATION), megamenu)
  app.get("/home", cacheWithRedis(API_CACHE_EXPIRATION), home)
  app.get("/footer", cacheWithRedis(API_CACHE_EXPIRATION), footer)
}
