const { get, size, flatMap } = require("lodash")
const { cart } = require("../services/commercetools")
const { logger } = require("./logger")

/**
 * validate cart details before placing order
 */
const validCartToPlaceOrder = async ({ cartId, cartVersion = null }) => {
  let cartDetails = {}
  let validCart = false
  let cartResponse = await cart.cartById({ cartId: cartId })
  if (!!size(cartResponse.body)) {
    if (
      !!size(cartResponse.body.shippingAddress) &&
      !!size(cartResponse.body.billingAddress) &&
      cartResponse.body.cartState === "Active" ||
      cartResponse.body.version === cartVersion
    ) {
      validCart = true
    }
    cartDetails.shippingAddress = cartResponse.body.shippingAddress
    cartDetails.billingAddress = cartResponse.body.billingAddress
    cartDetails.cartState = cartResponse.body.cartState
    cartDetails.cartVersion = cartResponse.body.version
  }
  cartDetails.validCart = validCart
  return cartDetails
}

module.exports = {
  validCartToPlaceOrder,
}
