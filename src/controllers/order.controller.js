const Joi = require("joi")
const { order, cart, customer, payment, cart: Cart } = require("../services/commercetools")
const { get, size } = require("lodash")
const { checkout } = require("../services/checkout.com")
const {
  CART_CURRENCY
} = require("../constant")
const { logger } = require("../utils/logger")
const { validCartToPlaceOrder } = require("../utils/order.utils")
const { apiCall } = require("../utils/common")
const { checkCustomerExistence } = require("../services/commercetools/customer")

/**
 * Place order
 * order number will be generated here
 * new cart will be created. if user is logged in then cart
 * will be created for logged in user else it will create guest user
 *
 * @param {object} req
 * @param {object} res
 */
const placeOrder = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } }),
      cartId: Joi.string().empty().required(),
      cartVersion: Joi.number().empty().required(),
      payment_method_type: Joi.string().valid('cod', 'paypal', 'card').required(),
      payment: Joi.object({
        context_id: Joi.string(),
        type: Joi.string(),
        token: Joi.string(),
        payment_action: Joi.string(),
        payment_id: Joi.string(),
      }),
    })
    await joiSchema.validateAsync(req.body)
    const { cartId, cartVersion, payment_method_type, payment, email } = req.body
    let customerId = req.headers.customerId
    const validCartDetails = await validCartToPlaceOrder({
      cartId: cartId,
      cartVersion: cartVersion,
    })
    logger.info(validCartDetails)
    if (!size(customerId)) {
      //user is not logged in
      console.log("customerId", customerId)

      // check customer exist through email
      const { body: { results: [checkCustomerExist] } } = await checkCustomerExistence({ email: email })
      console.log("checkCustomerExist", checkCustomerExist)
      if (checkCustomerExist) {
        customerId = checkCustomerExist.id
      }
      //Get customerId for Guest User from cart details
      let cartResponse = await cart.cartById({ cartId: cartId })
      if (!!size(cartResponse.body) && !size(customerId)) {
        console.log("cartResponse.body.customerId", cartResponse.body.customerId)
        customerId = cartResponse.body.customerId
      }
    }
    logger.info(customerId)
    if (validCartDetails.validCart) {
      if (payment_method_type.toUpperCase() === "COD") {
        const createOrderResult = await createOrder({
          customerId: customerId,
          cartId: cartId,
          cartVersion: cartVersion,
        })
        res.status(200).json({
          order: {
            ...createOrderResult.placeOrderRes.body,
          },
          cart: {
            ...createOrderResult.createCartRes.body,
          },
        })
      } else if (payment_method_type.toUpperCase() === "PAYPAL") {
        //Checkout.com paypal capture payment flow
        if (payment.payment_action.toUpperCase() == "CAPTURE") {
          //Capture Payment via checkout.com for Paypal
          if (!!size(payment.payment_id)) {
            //Get checkout.com Payment details
            const paymentDetails = await checkout.getPaymentDetails({
              paymentId: payment.payment_id,
            })
            logger.info(paymentDetails)
            if (!!size(paymentDetails.metadata) && !!size(paymentDetails.reference)) {
              //Capture payments
              const paymentCaptureRes = await checkout.capturePayment({ paymentId: paymentDetails.id, amount: paymentDetails.amount, reference: paymentDetails.reference, metadata: paymentDetails.metadata })
              logger.info(paymentCaptureRes)
              if (!!size(paymentCaptureRes.reference)) {
                //if payment capture Sccess then create order
                const createOrderResult = await createOrder({
                  customerId: customerId,
                  cartId: cartId,
                  cartVersion: cartVersion,
                })
                logger.info(createOrderResult)
                res.status(200).json({
                  order: {
                    ...createOrderResult.placeOrderRes.body,
                  },
                  cart: {
                    ...createOrderResult.createCartRes.body,
                  },
                  payment: paymentCaptureRes,
                })
              } else {
                res.status(400).json({
                  message: "Order placed failed due to capture payment failure",
                  description: paymentCaptureRes,
                })
              }
            } else {
              res.status(400).json({
                message: "Order placed failed due to get payment details failure",
                description: paymentDetails,
              })
            }
          } else {
            res.status(400).json({
              message: "Order placed failed due to invalid payment id",
              description: payment.payment_id,
            })
          }
        }
      }
      else if (payment_method_type.toUpperCase() === "CARD") {
        //Request Payment via checkout.com
        // const dataObj = {
        //   method: "post",
        //   url: `${CHECKOUT_COM_API_URL}${CHECKOUT_COM_REQUEST_PAYMENT}`,
        //   data: {
        //     context_id: payment.context_id,
        //     type: payment.type,
        //     token: payment.token,
        //   },
        // }
        // const paymentRequestRes = await checkout.requestPayment(dataObj)
        const data = {
          context_id: payment.context_id,
          type: payment.type,
          token: payment.token,
        }
        const headers = {
          "Content-Type": "application/json",
          Authorization: CHECKOUT_COM_PUBLIC_KEY,
        }
        const paymentRequestRes = await apiCall({ method: 'post', url: `${CHECKOUT_COM_API_URL}${CHECKOUT_COM_REQUEST_PAYMENT}`, data: data, headers: headers })
        logger.info(paymentRequestRes)
        if (!!size(paymentRequestRes.payment_id)) {
          //Get checkout.com Payment details
          const paymentDetails = await checkout.getPaymentDetails({
            paymentId: paymentRequestRes.payment_id,
          })
          logger.info(paymentDetails)
          if (!!size(paymentDetails.metadata) && !!size(paymentDetails.reference)) {
            //Capture payments
            const paymentCaptureRes = await checkout.capturePayment({ paymentId: paymentDetails.id, amount: paymentDetails.amount, reference: paymentDetails.reference, metadata: paymentDetails.metadata })
            logger.info(paymentCaptureRes)
            if (!!size(paymentCaptureRes.reference)) {
              //if payment capture Sccess then create order
              const createOrderResult = await createOrder({
                customerId: customerId,
                cartId: cartId,
                cartVersion: cartVersion,
              })
              logger.info(createOrderResult)
              res.status(200).json({
                order: {
                  ...createOrderResult.placeOrderRes.body,
                },
                cart: {
                  ...createOrderResult.createCartRes.body,
                },
                payment: paymentCaptureRes,
              })
            } else {
              res.status(400).json({
                message: "Order placed failed due to capture payment failure",
                description: paymentCaptureRes,
              })
            }
          } else {
            res.status(400).json({
              message: "Order placed failed due to get payment details failure",
              description: paymentDetails,
            })
          }
        } else {
          res.status(400).json({
            message: "Order placed failed due to Request payment failure",
            description: paymentRequestRes,
          })
        }
      }
    } else {
      res.status(400).json({
        message: "Order placed failed due to invalid cart",
        description: validCartDetails,
      })
    }
  } catch (error) {
    logger.error(error)
    res.status(400).json({
      error,
    })
  }
}

/**
 * Method to create order flow
 */

const createOrder = async ({ customerId, cartId, cartVersion }) => {
  const orderNumber = String(Date.now())
  const dataObj = {
    body: {
      id: cartId,
      version: cartVersion,
      orderNumber: orderNumber,
    },
  }
  const placeOrderRes = await order.createOrder(dataObj)
  let createCartRes
  if (customerId) {
    const customerRes = await customer.customerById({ customerId })
    // create new cart as previous will be inactive
    const cartDataObj = {
      body: {
        currency: CART_CURRENCY,
        customerId,
        customerEmail: get(customerRes, "body.email", ""),
      },
    }
    createCartRes = await cart.createCart(cartDataObj)
    logger.info(createCartRes)
  } else {
    // create new cart as previous will be inactive
    const cartDataObj = {
      body: {
        currency: CART_CURRENCY,
      },
    }
    createCartRes = await cart.createCart(cartDataObj)
    console.log(createCartRes)
  }
  if (!size(customerId)) {
    // only works for guest customer
    mergeGuestOrderWishCustomerIfExist(createCartRes.body.id, placeOrderRes.body)
  }
  const result = {
    placeOrderRes: placeOrderRes,
    createCartRes: createCartRes,
  }
  return result
}

/**
 * Get Cart info from id and get email of user
 * Get customer data from email
 * Get id and version from the order place res
 * update order info
 */
const mergeGuestOrderWishCustomerIfExist = async (cartId, placedOrder) => {
  const cartRes = await cart.cartById({ cartId: cartId })

  const emailExistRes = await customer.checkCustomerExistence({
    email: cartRes.body.customerEmail,
  })
  if (emailExistRes.body.count > 0) {
    const customerId = get(emailExistRes, "body.results[0].id", "")
    const orderUpdateDataObj = {
      orderId: get(placedOrder, "id", ""),
      body: {
        version: get(placedOrder, "version", 1),
        actions: [
          {
            action: "setCustomerId",
            customerId,
          },
        ],
      },
    }
    const orderUpdateRes = await order.updateOrderById(orderUpdateDataObj)
  }
}

/*
 * Update Address by cartId
 */
const updateAddress = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      cartId: Joi.string().required(),
      version: Joi.number().required(),
      actions: Joi.array().required(),
    })
    await joiSchema.validateAsync(req.body)
    const { cartId, ...restBody } = req.body
    const dataObj = {
      cartId: cartId,
      body: restBody,
    }
    const cartRes = await cart.updateCart(dataObj)
    res.status(200).json({
      ...cartRes.body,
    })
  } catch (error) {
    logger.error(error)
    res.status(400).json({
      error,
    })
  }
}

/**
 * Get Shipping Methods for a Cart By cartId
 * @param {object} req
 * @param {object} res
 */
const getShippingMethodsForCartById = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      id: Joi.string().empty().required(),
    })
    await joiSchema.validateAsync(req.query)
    let shippingMethodsRes = await order.getShippingMethodsForCart({
      cartId: req.query.id,
    })
    res.status(200).json({
      ...shippingMethodsRes.body,
    })
  } catch (error) {
    logger.error(error)
    res.status(400).json({
      error,
    })
  }
}

/**
 * Get Payment Details By PaymentID
 * @param {object} req
 * @param {object} res
 */

const getPaymentById = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      id: Joi.string().empty().required(),
    })
    await joiSchema.validateAsync(req.params)
    try {
      let paymentRes = await payment.getPaymentById({
        paymentId: req.params.id,
      })
      res.status(200).json({
        success: true,
        message: "Payment Details By ID",
        payment: paymentRes.body,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in gettig payment details!",
        description: error,
      })
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

/**
 * update payment by paymentID
 * @param {object} req
 * @param {object} res
 */
const updatePaymentById = async (req, res) => {
  try {
    try {
      const joiSchema = Joi.object({
        id: Joi.string().empty().required(),
        cart_id: Joi.string().required(),
        cart_version: Joi.number().required(),
        payment_option: Joi.object({
          version: Joi.number().required(),
          currency: Joi.string().required(),
          amount: Joi.number().required(),
          method: Joi.string().required(),
          name: Joi.string().required(),
        }),
      })
      await joiSchema.validateAsync({ ...req.body, ...req.params })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        description: error,
      })
    }

    let payment_version = -1
    const paymentId = req.params.id
    //update amount
    const updatePaymentObj = {
      paymentId: paymentId,
      body: {
        version: req.body.payment_option.version,
        actions: [
          {
            action: "changeAmountPlanned",
            amount: {
              currencyCode: req.body.payment_option.currency,
              centAmount: req.body.payment_option.amount,
            },
          },
          {
            action: "setMethodInfoMethod",
            method: req.body.payment_option.method,
          },
          {
            action: "setMethodInfoName",
            name: {
              en: req.body.payment_option.name,
            },
          },
        ],
      },
    }
    const updatePaymentRes = await payment.updatePaymentById(updatePaymentObj)
    payment_version = updatePaymentRes.body.version

    res.status(200).json({
      payment: {
        id: paymentId,
        version: payment_version,
        method: get(updatePaymentRes, "body.paymentMethodInfo.method", ""),
        name: get(updatePaymentRes, "body.paymentMethodInfo.name.en", ""),
      },
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

/**
 * controller to get orders based on customer id
 * @param {object} req
 * @param {object} res
 */
const getCustomerOrders = async (req, res) => {
  try {
    const offset = !!size(req.query.offset) ? Number(req.query.offset) : 0
    const { customerId } = req.headers

    const orderRes = await order.getOrders({ customerId, offset })
    res.status(orderRes.statusCode).json({ ...orderRes.body })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

/**
 * get order details based on order number
 * @param {object} req
 * @param {object} res
 */
const getOrdersDetailsByOrderNumber = async (req, res) => {
  try {
    const orderNumber = String(req.params.orderNumber)
    try {
      await Joi.object({
        orderNumber: Joi.string().required(),
      }).validateAsync({ orderNumber })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }

    const orderDetailsRes = await order.getOrderDetailsByOrderNumber(orderNumber)
    const paymentId = get(
      orderDetailsRes.body,
      "results[0].paymentInfo.payments[0].id",
      ""
    )

    // get payment info based on payment id
    const paymentInfoRes = payment.getPaymentById({ paymentId })
    res
      .status(orderDetailsRes.statusCode)
      .json({ ...orderDetailsRes.body.results[0], paymentInfo: paymentInfoRes.body })
  } catch (err) {
    return res.status(400).json(err)
  }
}

module.exports = {
  placeOrder,
  updateAddress,
  getShippingMethodsForCartById,
  getPaymentById,
  updatePaymentById,
  getCustomerOrders,
  getOrdersDetailsByOrderNumber,
}
