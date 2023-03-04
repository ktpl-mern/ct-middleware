const Joi = require("joi")
const { apiRoot } = require("../services")
const { wishlist, customer, cart } = require("../services/commercetools")
const { generateToken } = require("../middleware/auth.middleware")
const { size, has, get } = require("lodash")
const { CART_CURRENCY } = require("../constant")
const { apiCall } = require("../utils/common")

/**
 * Create user in commercetools
 * @param {object} req
 * @param {object} res
 */
const signup = async (req, res) => {
  try {
    try {
      const joiSchema = Joi.object({
        firstName: Joi.string().min(3).required(),
        lastName: Joi.string().min(3).required(),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        password: Joi.string().min(8).required(),
      })
      await joiSchema.validateAsync({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in creating customer!",
        description: error.message,
      })
    }
    const dataObj = {
      body: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      },
    }
    if (!!size(req.body.cartId)) {
      dataObj.body.anonymousCart = {
        id: req.body.cartId,
        typeId: "cart",
      }
    }
    const createCustomerRes = await customer.createCustomer(dataObj)
    const customerData = get(createCustomerRes.body, "customer", {})
    const customerId = customerData.id
    const token = await generateToken({ customerId })
    // check for cart as well if cart is not exist then create cart
    let cartObj = {}
    if (!has(createCustomerRes.body, "cart")) {
      const dataObj = {
        body: {
          currency: CART_CURRENCY,
          customerId,
          customerEmail: get(customerData, "email", ""),
        },
      }
      const cartResponse = await cart.createCart(dataObj)
      cartObj = get(cartResponse, "body", {})
    } else {
      cartObj = get(createCustomerRes, "body.cart", {})
    }

    //wishlist chek if does not exist then create defaultwishlist
    // const wishlistDataObj = {
    //   key: "main",
    //   customerId: customerId,
    // }
    // const userWishlist = await wishlist.getMainWishlist(wishlistDataObj)
    //wishlist does not exist so create default main wishlist
    // let wishlistCount = "0"
    // if (!!size(userWishlist.id)) {
    //   wishlistCount = size(userWishlist.lineItems)
    // } else {
    const DefaultWishlistDataObj = {
      name: {
        en: "main",
      },
      key: `${customerId}`,
      customer: {
        id: customerId,
      },
    }
    const wishList = await wishlist.createDefaultWishlist({
      body: DefaultWishlistDataObj,
    })
    // }
    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      token: token,
      customer: customerData,
      cart: cartObj,
      // wishlist: {
      //   wishlistCount: Number(wishlistCount),
      //   version: userWishlist.version,
      //   id: userWishlist.id,
      // },
      // wishList: {
      //   id: wishList.id,
      //   version: wishList.version
      // }
      wishlist: wishList,
    })
  } catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
}

/**
 * login user.
 *
 * Token will be generated baed on customerid
 * Cart and wishlist related data will be provided with login
 * Both are created if the didn't exist
 *
 *
 * @param {object} req
 * @param {object} res
 */
const login = async (req, res) => {
  try {
    try {
      const joiSchema = Joi.object({
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        password: Joi.string().min(8).required(),
        cartId: Joi.string().empty(),
      })
      await joiSchema.validateAsync({
        email: req.body.email,
        password: req.body.password,
        cartId: req.body.cartId,
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error in login customer!",
        description: error.message,
      })
    }

    const dataObj = {
      body: {
        email: req.body.email,
        password: req.body.password,
      },
    }
    if (!!size(req.body.cartId)) {
      dataObj.body.anonymousCart = {
        id: req.body.cartId,
        typeId: "cart",
      }
    }
    const loginRes = await customer.authenticateCustomer(dataObj)
    console.log("loginRes", loginRes)
    const customerData = get(loginRes.body, "customer", {})
    const customerId = customerData.id
    const token = await generateToken({ customerId })
    // check for cart as well if cart is not exist then create cart
    let cartObj = {}
    if (!has(loginRes.body, "cart")) {
      // cart not found so creating cart
      const dataObj = {
        body: {
          currency: CART_CURRENCY,
          customerId,
          customerEmail: get(customerData, "email", ""),
        },
      }
      const cartResponse = await cart.createCart(dataObj)
      cartObj = get(cartResponse, "body", {})
    } else {
      cartObj = get(loginRes, "body.cart", {})
    }
    //wishlist chek if does not exist then create defaultwishlist
    const wishlistDataObj = {
      // key: "main",
      key: customerId,
      customerId: customerId,
    }
    let userWishList = null
    try {
      userWishList = await wishlist.getMainWishlist(wishlistDataObj)
    } catch (error) {
      console.log("catch")
      const DefaultWishlistDataObj = {
        name: {
          en: "main",
        },
        // key: "main",
        key: `${customerId}`,
        customer: {
          id: customerId,
        },
      }
      userWishList = await wishlist.createDefaultWishlist({
        body: DefaultWishlistDataObj,
      })
      console.log(userWishList)
    }
    // console.log("userWishList", userWishlist)
    //wishlist does not exist so create default main wishlist
    // let wishlistCount = "0"
    // if (!!size(userWishlist.id)) {
    //   wishlistCount = size(userWishlist.lineItems)
    // } else {
    //   const DefaultWishlistDataObj = {
    //     name: {
    //       en: "main",
    //     },
    //     // key: "main",
    //     key: `${customerId}`,
    //     customer: {
    //       id: customerId,
    //     },
    //   }
    //   await wishlist.createDefaultWishlist(DefaultWishlistDataObj)
    // }
    res.status(200).json({
      success: true,
      message: "Customer login successfully",
      token,
      customer: customerData,
      cart: cartObj,
      // wishlist: {
      //   wishlistCount: Number(wishlistCount),
      //   version: userWishlist.version,
      //   id: userWishlist.id,
      // },
      wishlist: userWishList,
    })
  } catch (err) {
    console.log("err:", err)
    res.status(400).json(err)
  }
}

const mobileOtpGenerate = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      phoneNumber: Joi.string().required(),
      recaptchaToken: Joi.string().required()
    })

    await joiSchema.validateAsync({
      phoneNumber: req.body.phoneNumber,
      recaptchaToken: req.body.recaptchaToken
    })

    const headers = {
      "Content-Type": "application/json",
      // Authorization: ,
    }


    const response = await apiCall({
      method: "Post", data: { ...req.body }, headers, url: 'https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=AIzaSyBLuGLnYsYGVfZEHKX68RPC6SrNgk43USU',
      params: { key: 'AIzaSyBLuGLnYsYGVfZEHKX68RPC6SrNgk43USU' }
    })

    res.status(200).json(response)


  } catch (error) {
    console.log("err:", err)
    res.status(400).json(err)
  }
}

module.exports = {
  signup,
  login,
  mobileOtpGenerate
}
