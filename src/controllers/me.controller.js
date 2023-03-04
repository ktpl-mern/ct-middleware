const Joi = require("joi")
const { get, size } = require("lodash")
const { customer, cart, wishlist } = require("../services/commercetools")
const { CART_CURRENCY } = require("../constant")

/**
 * Get Customer Details by  Id
 * @param {string} customerId - customer Id
 */

const getCustomerById = async (req, res) => {
    try {
        const { customerId } = req.headers
        const customerRes = await customer.customerById({ customerId: customerId })
        res.status(200).json({
            success: true,
            message: "Customer Details By ID",
            customer: customerRes.body,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error in gettig Customer details!",
            description: error,
        })
    }
}

/**
 * Change password of the user
 * @param {number} version - version number
 * @param {string} currentPassword - current Password of the user
 * @param {string} newPassword - new password of the user
 */

const changePassword = async (req, res) => {
    try {
        try {
            const joiSchema = Joi.object({
                version: Joi.number().required(),
                currentPassword: Joi.string().min(8).required(),
                newPassword: Joi.string().min(8).required(),
            })
            await joiSchema.validateAsync(req.body)
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            })
        }
        const { customerId } = req.headers
        const dataObj = {
            body: {
                id: customerId,
                version: req.body.version,
                currentPassword: req.body.currentPassword,
                newPassword: req.body.newPassword,
            },
        }
        const changePasswordRes = await customer.updatePassword(dataObj)
        res.status(200).json({
            success: true,
            message: "Password changed successfully!",
            customer: changePasswordRes.body,
        })
    } catch (err) {
        res.status(400).json(err)
    }
}

/**
 * Get Cart Details API by id
 * @param {string} id
 */

const getCartById = async (req, res) => {
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

        res.status(200).json({
            success: true,
            message: "Cart Details By ID",
            cart: cartResponse.body,
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err,
        })
    }
}

/**
 * Create Cart Details API
 * @param {string} customerId
 */

const createCart = async (req, res) => {
    try {
        const { customerId } = req.headers
        const customerRes = await customer.customerById({ customerId: customerId })
        const dataObj = {
            body: {
                currency: CART_CURRENCY,
                customerId,
                customerEmail: get(customerRes, "body.email", ""),
            },
        }
        const cartResponse = await cart.createCart(dataObj)
        res.status(201).json({
            success: true,
            message: "Cart created successfully",
            cart: cartResponse.body,
        })
    } catch (error) {
        res.status(400).json(err)
    }
}

/**
 * Update Cart Details API by cartId
 * @param {string} id
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
                description: error.message,
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
        res.status(400).json(err)
    }
}


module.exports = {
    getCustomerById,
    changePassword,
    createCart,
    getCartById,
    updateCartById,
    updateCustomerInfoById,
    saveForLater,
}
