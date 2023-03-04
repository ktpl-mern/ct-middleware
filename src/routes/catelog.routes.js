const apicache = require("apicache")
const { redisClient } = require("../services")
let cacheWithRedis = apicache.options(redisClient).middleware
const { API_CACHE_EXPIRATION } = require("../config")
const {
  getAllProducts,
  serachProductsByFilter,
  // getProductsFilters,
  serachProductsByText,
  getConfigurableProduct,
  getProductsByKey,
  getProductsByBrandId
} = require("../controllers/product.controller")

const { getCategoryById, getAllCategory, getCategoryByKey } = require("../controllers/category.controller")

const {
  getProductBundleById,
  createProductBundle,
  updateProductBundleById,
  deleteProductBundleById,
} = require("../controllers/product.bundle.controller")

const { getProductReviews } = require("../controllers/review.controller")
module.exports = function (app) {
  //API EndPoints
  app.get("/products/all", cacheWithRedis(API_CACHE_EXPIRATION), getAllProducts)

  app.get("/search", cacheWithRedis(API_CACHE_EXPIRATION), serachProductsByText)
  app.get("/products", serachProductsByFilter)
  app.get('/products/:id/reviews', getProductReviews)
  app.get("/products/:key", getProductsByKey)
  app.get("/search/products/:categoryKey", serachProductsByFilter)
  app.get("/products/brand/:brandId", getProductsByBrandId)
  app.get("/config/product", getConfigurableProduct)

  app.get("/category/:id", getCategoryById)
  app.get("/category/key/:key", getCategoryByKey)
  app.get("/list/category", getAllCategory)

  //Produc Bundle API End Points
  app.get("/product/bundle/:id", getProductBundleById)
  app.post("/product/bundle", createProductBundle)
  app.put("/product/bundle/:id", updateProductBundleById)
  app.delete("/product/bundle/:id", deleteProductBundleById)
}
