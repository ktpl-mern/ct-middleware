const {
  getCustomerById,
  changePassword,
  createCart,
  getCartById,
  updateCartById,
  updateCustomerInfoById,
  saveForLater,
} = require("../controllers/me.controller")
const {
  getCustomerOrders,
  getOrdersDetailsByOrderNumber,
} = require("../controllers/order.controller")
const {
  createDefaultWishlist,
  getMainWishlist,
  addProductsToWishlist,
  removeProductFromWishlist,
  updateWishlistItemQty,
  moveToBag,
  shareWishlist,
  deleteWishlistByID
} = require("../controllers/wishlist.controller")

module.exports = function (app) {
  //API EndPoints
  app.get("/me", getCustomerById)
  app.put("/me/changePassword", changePassword)
  app.put("/me/info", updateCustomerInfoById)

  //Logged in Customer cart releated api end point
  app.post("/me/cart", createCart)
  app.get("/me/cart/:id", getCartById)
  // this put api will do add , update , delete line items operations
  app.put("/me/cart/:id", updateCartById)
  //Save for Later API
  app.put("/me/cart/product/saveForLater", saveForLater)

  //Wishlist API
  app.get("/me/wishlist", getMainWishlist)
  app.post("/me/wishlist", createDefaultWishlist)
  app.put("/me/wishlist/:id/add", addProductsToWishlist)
  app.put("/me/wishlist/:id/remove", removeProductFromWishlist)
  app.put("/me/wishlist/:id/update", updateWishlistItemQty)
  app.post("/me/wishlist/:id/moveToBag", moveToBag)
  app.post("/wishlist/share", shareWishlist)
  app.delete('/me/wishlist/:id/:version', deleteWishlistByID)

  // Orders API
  app.get("/me/orders", getCustomerOrders)
  app.get("/me/orders/:orderNumber", getOrdersDetailsByOrderNumber)
}
