const Joi = require("joi")
const { isEmpty, size, flatMap, get, find, has } = require("lodash")
const { wishlist, product, cart } = require("../services/commercetools")
const { sendEmail } = require("../services")
const { EMAIL_FROM_ADDRESS } = require("../config")
const { readFile } = require("fs/promises")
const { toEUR } = require("../utils/product.utils")

/*
 * Create default wishlist
 */
const createDefaultWishlist = async (req, res) => {
  try {
    const { customerId } = req.headers
    const dataObj = {
      body: {
        name: {
          en: "main",
        },
        key: "main",
        customer: {
          id: customerId,
        },
      },
    }
    const wishlistResponse = await wishlist.createDefaultWishlist(dataObj)
    res.status(200).json({
      success: true,
      message: "Wishlist created successfully",
      wishlistDetails: wishlistResponse,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in creating wishlist!",
      description: error,
    })
  }
}

/**
 * Get Main Wishlist as we are only providing single wishlist
 */
const getMainWishlist = async (req, res) => {
  try {
    const { customerId } = req.headers
    const dataObj = {
      // key: "main",
      key: customerId,
      customerId: customerId,
    }
    const wishlistResponse = await wishlist.getMainWishlist(dataObj)

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist: wishlistResponse,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching wishlist!",
      description: error,
    })
  }
}

/**
 * add products to wishlist
 */
const addProductsToWishlist = async (req, res) => {
  if (!isEmpty(req.body)) {
    try {
      const wishlistId = req.params.id
      const wishlistResponse = await wishlist.addProductsToWishlist(wishlistId, req.body)
      res.status(200).json({
        ...wishlistResponse,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in updating product to wishlist!",
        description: error,
      })
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Required parameters missing!",
    })
  }
}

/**
 * remove products from the wishlist
 */
const removeProductFromWishlist = async (req, res) => {
  if (!isEmpty(req.body)) {
    try {
      const wishlistId = req.params.id

      const wishlistResponse = await wishlist.removeProductFromWishlist(
        wishlistId,
        req.body
      )
      res.status(200).json({
        ...wishlistResponse,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in removing product from wishlist!",
        description: error,
      })
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Required parameters missing!",
    })
  }
}

/**
 * update quanity in wishlist
 */
const updateWishlistItemQty = async (req, res) => {
  if (!isEmpty(req.body)) {
    try {
      const wishlistId = req.params.id
      console.log(
        "🚀 ~ file: wishlist.controller.js ~ line 129 ~ updateWishlistItemQty ~ wishlistId",
        wishlistId
      )
      const wishlistResponse = await wishlist.updateWishlistItemQty(wishlistId, req.body)
      res.status(200).json({
        ...wishlistResponse,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in adding quanity to wishlist!",
        description: error,
      })
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Required parameters missing!",
    })
  }
}

/**
 * Add product to cart and remove it from the wishlist
 * @param {string} customerId - customerId to get customer cart so that we can add product to cart
 * @param {string} wishlistId - wishlistId of wishlist for removing item from the wishlist
 * @param {object} product  - product will contain keys that will required to add product to cart and remove from wishlist
 * @param {string} product.productId - id of the product
 * @param {string} product.lineItemId - id of wishlist item id
 * @param {string} product.quantity - quantity of the product
 */

const moveToBag = async (req, res) => {
  try {
    const wishlistId = req.params.id
    const { customerId } = req.headers
    try {
      await Joi.object({
        customerId: Joi.string().required(),
        id: Joi.string().required(),
        version: Joi.number().required(),
        lineItemId: Joi.string().required(),
        productId: Joi.string().required(),
        quantity: Joi.number().required(),
      }).validateAsync({ customerId, id: wishlistId, ...req.body })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
    const moveToBagRes = await wishlist.moveToBag(customerId, wishlistId, req.body)
    res.status(200).json(moveToBagRes)
  } catch (err) {
    res.status(400).json(err)
  }
}

/**
 * Share wishlist details to email
 * @param {string} email - email Id to which you want to send wishlist details
 */

const shareWishlist = async (req, res) => {
  try {
    try {
      const joiSchema = Joi.object({
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
      })
      await joiSchema.validateAsync(req.body)
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in sharing wishlist!",
        description: error,
      })
    }

    const { customerId } = req.headers
    const wishlistRes = await wishlist.getMainWishlist({
      // key: "main",
      key: `${customerId}`,
      customerId: customerId,
    })
    //Email Send
    const emailTemplateContent = await readFile(
      "src/services/mail/wishlistEmailTemplate.html",
      "utf-8"
    )
    let productHtmlContent = ""
    wishlistRes.lineItems.forEach(function (item) {
      const productImageUrl = item.product.images[0].url
      const productName = item.name.en
      const productQuantity = item.quantity
      const currencyCode = item.product.price.value.currencyCode
      let price = get(item, "product.price.discounted.value.centAmount", null)
      if (!!size(price)) {
        price = parseFloat(toEUR(price)).toFixed(
          get(item, "product.price.discounted.value.fractionDigits", 2)
        )
      } else {
        price = parseFloat(toEUR(get(item, "product.price.value.centAmount", 0))).toFixed(
          get(item, "product.price.value.fractionDigits", 2)
        )
      }
      productHtmlContent =
        productHtmlContent +
        `<tr> 
          <td class="esd-structure es-p10t es-p10b es-p20r es-p20l" align="left" bgcolor="#ffffff" style="background-color: #ffffff" esd-custom-block-id="266304" > 
          <table cellpadding="0" cellspacing="0" class="es-left" align="left" > <tbody> <tr> <td width="128" class="es-m-p0r esd-container-frame es-m-p20b" align="center" > <table cellpadding="0" cellspacing="0" width="100%"> <tbody> <tr> <td align="center" class="esd-block-image" style="font-size: 0px" > <a target="_blank" href="" ><img src=${productImageUrl} alt style="display: block" width="128" /></a> </td> </tr> </tbody> </table> </td> <td width="5" class="es-hidden"></td> </tr> </tbody> </table> 
          <table cellpadding="0" cellspacing="0" class="es-left" align="left" > <tbody> <tr> <td width="128" class="esd-container-frame es-m-p20b" align="center" > <table cellpadding="0" cellspacing="0" width="100%"> <tbody> <tr> <td align="left" class="esd-block-text es-p5b es-p10r es-m-txt-c" > <p>${productName}</p> </td> </tr> <tr> <td align="left" class="esd-block-text es-p5t es-p5b es-p10r es-m-txt-c" > <p>QTY: <strong>${productQuantity}</strong></p> </td> </tr> <tr> <td align="left" class="esd-block-text es-p5t es-p5b es-p10r" > <h3>${currencyCode} ${price}</h3> </td> </tr> </tbody> </table> </td> <td width="5" class="es-hidden"></td> </tr> </tbody> </table> 
          </td> </tr>` +
        '<tr><td class="esd-structure es-p10r es-p10l" align="left" bgcolor="#ffffff" style="background-color: #ffffff"> <table cellpadding="0" cellspacing="0" width="100%"> <tbody> <tr> <td width="580" class="esd-container-frame" align="center" valign="top"> <table cellpadding="0" cellspacing="0" width="100%"> <tbody> <tr> <td align="center" class="esd-block-spacer es-p5t es-p5b" style="font-size: 0px"> <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0"> <tbody> <tr> <td style=" border-bottom: 1px solid #cccccc; background: none; height: 1px; width: 100%; margin: 0px; "></td></tr></tbody> </table> </td></tr></tbody> </table> </td></tr></tbody> </table> </td></tr>'
    })
    const emailTemplate = emailTemplateContent.replace(
      '<tr id="productsWishlist"></tr>',
      '<tr id="productsWishlist">' + productHtmlContent + "</tr>"
    )
    const msg = {
      to: req.body.email,
      from: EMAIL_FROM_ADDRESS, // Use the email address or domain you verified above
      subject: "YOU'VE LEFT SOMETHING BEHIND",
      html: emailTemplate,
    }
    const emailRes = await sendEmail({ msg: msg })
    res.status(200).json({
      success: true,
      message: "share wishlist completed successfully!",
      emailRes: emailRes,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

const deleteWishlistByID = async (req, res) => {
  try {
    console.log("deleteWishListByID")
    const joiSchema = Joi.object({
      id: Joi.string().required(),
      version: Joi.number().required()
    })
    await joiSchema.validateAsync(req.params)
    //delete wishList
    const { body } = await wishlist.deleteWishlist({
      shoppingListId: req.params.id,
      shoppingListVersion: req.params.version
    })
    //create new wishList
    const { customerId } = req.headers
    const dataObj = {
      body: {
        name: {
          en: "main",
        },
        key: customerId,
        customer: {
          id: customerId,
        },
      },
    }
    const wishlistResponse = await wishlist.createDefaultWishlist(dataObj)



    return res.status(200).json({
      ...wishlistResponse
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error
    })
  }
}

module.exports = {
  createDefaultWishlist,
  getMainWishlist,
  addProductsToWishlist,
  removeProductFromWishlist,
  updateWishlistItemQty,
  moveToBag,
  shareWishlist,
  deleteWishlistByID
}
