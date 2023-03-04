const Joi = require("joi")
const { get, size, capitalize } = require("lodash")
const { payment } = require("../services/commercetools")
const { apiRoot } = require("../services")
const { checkout } = require("../services/checkout.com")
const { CHECKOUT_COM_API_URL, CHECKOUT_COM_CREATE_CONTEXT } = require("../constant")
const { logger } = require("../utils/logger")
const { API_HOST_URL } = require("../config")
const { apiCall } = require("../utils/common")
const { CHECKOUT_COM_PUBLIC_KEY } = require("../config")

/**
 * create payment context and return payment options
 * @param {string} email - email id of the customer
 * @param {string} reference - cart id or order id
 */
async function fetchPaymentOptions(req, res) {
  try {
    const joiSchema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      reference: Joi.string().empty().required(),
    })
    await joiSchema.validateAsync({
      email: req.body.email,
      reference: req.body.reference,
    })
    let payment = {}
    try {
      //fetch payment options
      const contextResponse = await apiCall({
        method: "post",
        url: `${CHECKOUT_COM_API_URL}${CHECKOUT_COM_CREATE_CONTEXT}`,
        data: {
          reference: req.body.reference,
          customer_email: req.body.email,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: CHECKOUT_COM_PUBLIC_KEY,
        },
      })
      if (!!size(contextResponse.id)) {
        payment.context_id = contextResponse.id
        let payment_option = []
        //TODO :- UnComment below lines when need to enable paypal payment option
        contextResponse.apms.forEach(function (item) {
          if (item.name !== "sofort") {
            let obj = {
              payment_method_name: item.name,
              payment_method_label: capitalize(item.name),
              payment_method_logo_url: item.logo_url,
            }
            payment_option.push(obj)
          }
        })
        //Add Payment option for Card and COD
        payment_option.push(
          {
            payment_method_name: "card",
            payment_method_label: "Card",
            payment_method_logo_url: API_HOST_URL + "/assets/card-logo.svg",
          },
          {
            payment_method_name: "cod",
            payment_method_label: "Cash on Delivery",
            payment_method_logo_url: API_HOST_URL + "/assets/cod-logo.png",
          }
        )
        payment.payment_settings = contextResponse.payment_settings
        payment.payment_option = payment_option
      } else {
        // if checkout.com failed then it should return COD only
        payment.payment_option = [
          {
            payment_method_name: "cod",
            payment_method_label: "Cash on Delivery",
            payment_method_logo_url: API_HOST_URL + "/assets/cod-logo.png",
          },
        ]
      }
    } catch (err) {
      console.log("🚀 ~ file: checkout.controller.js:74 ~ fetchPaymentOptions ~ err", err)
      // if checkout.com is failed the it will reeturn only COD payment method
      payment.payment_option = [
        {
          payment_method_name: "cod",
          payment_method_label: "Cash on Delivery",
          payment_method_logo_url: API_HOST_URL + "/assets/cod-logo.png",
        },
      ]
    }
    console.log(
      "🚀 ~ file: checkout.controller.js:80 ~ fetchPaymentOptions ~ payment",
      payment
    )

    res.status(200).json({
      ...payment,
    })
  } catch (error) {
    logger.error(error)
    res.status(400).json({
      error,
    })
  }
}

/**
 * It will create payment
 * @param {object} req
 * @param {object} res
 */
async function createPayment(req, res) {
  try {
    try {
      const joiSchema = Joi.object({
        cart_id: Joi.string().required(),
        cart_version: Joi.number().required(),
        payment_option: Joi.object({
          amount: Joi.number().required(),
          currency: Joi.string().required(),
          method: Joi.string().required(),
          name: Joi.string().required(),
        }).required(),
      })

      await joiSchema.validateAsync(req.body)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }

    // create payment option
    const createPaymentRes = await payment.createPayment(req.body)
    const paymentId = get(createPaymentRes.body, "id", "")
    const cartUpdateRes = await apiRoot
      .carts()
      .withId({ ID: req.body.cart_id })
      .post({
        body: {
          version: req.body.cart_version,
          actions: [
            {
              action: "addPayment",
              payment: {
                id: paymentId,
                typeId: "payment",
              },
            },
          ],
        },
      })
      .execute()

    res.status(createPaymentRes.statusCode).json({
      payment: {
        id: createPaymentRes.body.id,
        version: createPaymentRes.body.version,
        method: get(createPaymentRes, "body.paymentMethodInfo.method", ""),
        name: get(createPaymentRes, "body.paymentMethodInfo.name.en", ""),
      },
      cart: { ...get(cartUpdateRes, "body", {}) },
    })
  } catch (err) {
    console.log("🚀 ~ file: checkout.controller.js ~ line 91 ~ createPayment ~ err", err)
    res
      .status(Number(get(err, "response.status", 400)))
      .json({ message: get(err, "response.data.message", "") })
  }
}

module.exports = {
  createPayment,
  fetchPaymentOptions,
}
