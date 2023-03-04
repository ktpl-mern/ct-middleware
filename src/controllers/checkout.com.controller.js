const Joi = require("joi")
const {
  CHECKOUT_COM_API_URL,
  CHECKOUT_COM_REQUEST_PAYMENT,
  CHECKOUT_COM_CREATE_CONTEXT,
} = require("../constant")
const { isEmpty, size } = require("lodash")
const { validCartToPlaceOrder } = require("../utils/order.utils")
const { logger } = require("../utils/logger")
const { apiCall } = require("../utils/common")
const { CHECKOUT_COM_PUBLIC_KEY } = require("../config")
const { checkout } = require("../services/checkout.com")

//checkout.com headers
const headers = {
  "Content-Type": "application/json",
  Authorization: CHECKOUT_COM_PUBLIC_KEY,
}

/**
 * create context for payment
 * @param {Object} req.body - Sent create context details as object in body
 */
const createContext = async (req, res) => {
  if (!isEmpty(req.body)) {
    try {
      const contextResponse = await apiCall({ method: 'post', url: `${CHECKOUT_COM_API_URL}${CHECKOUT_COM_CREATE_CONTEXT}`, data: req.body, headers })
      res.status(201).json({
        ...contextResponse,
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
 * Request Payment
 * @param {Object} req.body - Sent request payment details as object in body
 */

const makePayment = async (req, res) => {
  if (!isEmpty(req.body)) {
    try {
      const paymentRequestRes = await apiCall({ method: 'post', url: `${CHECKOUT_COM_API_URL}${CHECKOUT_COM_REQUEST_PAYMENT}`, data: req.body, headers })
      res.status(201).json({
        ...paymentRequestRes,
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

async function paypalInitialized(req, res) {
  try {
    const joiSchema = Joi.object({
      cartId: Joi.string().empty().required(),
      payment: Joi.object({
        context_id: Joi.string(),
        successUrl: Joi.string(),
        failureUrl: Joi.string()
      }),
    })
    await joiSchema.validateAsync(req.body)
    const { cartId, payment } = req.body
    let customerId = req.headers.customerId
    const validCartDetails = await validCartToPlaceOrder({
      cartId: cartId,
      // cartVersion: cartVersion,
    })
    logger.info(validCartDetails)
    logger.info(customerId)
    if (validCartDetails.validCart) {
      //Request Payment via checkout.com for Paypal
      const data = {
        context_id: payment.context_id,
        type: 'paypal', //hard code paypal request
        success_url: payment.successUrl,
        failure_url: payment.failureUrl
      }
      const paymentRequestRes = await apiCall({ method: 'post', url: `${CHECKOUT_COM_API_URL}${CHECKOUT_COM_REQUEST_PAYMENT}`, data: data, headers })
      logger.info(paymentRequestRes)
      if (!!size(paymentRequestRes.payment_id)) {
        //Get checkout.com Payment details
        const paymentDetails = await checkout.getPaymentDetails({
          paymentId: paymentRequestRes.payment_id,
        })
        logger.info(paymentDetails)
        if (!!size(paymentDetails.metadata) && !!size(paymentDetails.reference)) {
          res.status(200).json({
            paymentRequestDetails: paymentRequestRes,
            paymentDetails: paymentDetails,
          })
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
    else {
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

module.exports = {
  createContext,
  makePayment,
  paypalInitialized
}
