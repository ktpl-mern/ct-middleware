const apicache = require("apicache")
const { redisClient } = require("../../services")
let cacheWithRedis = apicache.options(redisClient).middleware
const { API_CACHE_EXPIRATION } = require("../../config")

const {
  serachProductsByFilter,
  getProductsByKey,
} = require("../../controllers/v1/product.controller")
const { getAllBrand, getBrandByKey } = require("../../controllers/v1/custom.object.controller")

module.exports = function (app) {
  //API EndPoints
  app.get("/v1/products", serachProductsByFilter)
  app.get("/v1/products/:key", cacheWithRedis(API_CACHE_EXPIRATION), getProductsByKey)
  app.get("/v1/search/products/:categoryKey", serachProductsByFilter)

  // Brand API's
  app.get("/v1/brand", getAllBrand)
  app.get("/v1/brand/:key", getBrandByKey)
}
