const Joi = require("joi")
const { isEmpty } = require("lodash")
const { CART_STATE, CART_CURRENCY } = require("../constant")
const { cart } = require("../services/commercetools")

/**
 * @apiDefine CartNotFoundError
 *
 * @apiError CartNotFound The id of the Cart was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "CartNotFound"
 *     }
 */

/**
 * @api {get} /cart/:id Request Cart information
 * @apiName GetCart
 * @apiGroup Cart
 *
 * @apiParam {Number} id Cart unique ID.
 *
 * @apiSuccess {Boolean} success Success of API Response.
 * @apiSuccess {String} message  Message of the API Response.
 * @apiSuccess {Object} cart  Result of the Cart API Response.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Cart Details By ID",
 *       "cart": "cart Details"
 *     }
 *
 * @apiUse CartNotFoundError
 */
const getCartById = async (req, res) => {
  /* #swagger.security = [{
               "basicAuth": []
  }] */
  try {
    try {
      const joiSchema = Joi.object({
        id: Joi.string().empty().required(),
      })
      await joiSchema.validateAsync(req.params)
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
    let cartResponse = await cart.cartById({ cartId: req.params.id })
    if (cartResponse.body.cartState === CART_STATE) {
      const dataObj = {
        body: {
          currency: CART_CURRENCY,
        },
      }
      cartResponse = await cart.createCart(dataObj)
    }
    res.status(200).json({
      success: true,
      message: "Cart Details By ID",
      cart: cartResponse.body,
    })
  } catch (err) {
    res.status(400).json(err)
  }
}

/**
 * Create Cart
 * @param {Object} req.body - Sent create cart details as object in body
 */

const createCartDetails = async (req, res) => {
  if (!isEmpty(req.body)) {
    try {
      const cartResponse = await cart.createCart({ body: req.body })
      res.status(201).json({
        success: true,
        message: "Cart created successfully",
        cart: cartResponse.body,
      })
    } catch (error) {
      res.status(400).json(error)
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Required parameters missing!",
    })
  }
}

/**
 * Add , remove , update Quantity actions will be done by this
 * put api as commercetools has single endpoint to do such operations
 *
 * update Cart by cartId - Add , Update , Delete
 *
 * @param {string} id - cart Id
 */

const updateCartById = async (req, res) => {
  try {
    try {
      const joiSchema = Joi.object({
        id: Joi.string().empty().required(),
      })
      await joiSchema.validateAsync(req.params)
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in updating cart details!",
        description: error,
      })
    }

    const dataObj = {
      cartId: req.params.id,
      body: req.body,
    }
    const cartResponse = await cart.updateCart(dataObj)

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: cartResponse.body,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

module.exports = {
  getCartById,
  updateCartById,
  createCartDetails,
}
