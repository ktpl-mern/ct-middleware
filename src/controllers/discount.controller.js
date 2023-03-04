const Joi = require("joi")
const { discount } = require("../services/commercetools")
const { listDiscountCodes, listCartDiscount } = discount
/**
 * Get All Category Details
 * @param {string} limit - limit value to support pagination deafault is 20
 * @param {string} offset - offset value to support pagination default is 0
 */

const getDiscountCodes = async (req, res) => {
    try {
        const joiSchema = Joi.object({
            limit: Joi.number(),
            offset: Joi.number()
        })
        await joiSchema.validateAsync(req.query)
        const discountCodes = await listDiscountCodes({ ...req.query });
        res.status(200).json({
            ...discountCodes.body
        })
    } catch (error) {
        res.status(400).json({
            error,
        })
    }
}

/**
 * Get All Category Details
 * @param {string} limit - limit value to support pagination deafault is 20
 * @param {string} offset - offset value to support pagination default is 0
 */
const getCartDiscounts = async (req, res) => {
    try {
        const joiSchema = Joi.object({
            limit: Joi.number(),
            offset: Joi.number()
        })
        await joiSchema.validateAsync(req.query)
        const cartDiscount = await listCartDiscount({ ...req.query });
        res.status(200).json({
            ...cartDiscount.body
        })
    } catch (error) {
        res.status(400).json({
            error,
        })
    }
}

/**
 * apply discount code
 *
 * @param {string} id - cart Id
 * @param {number} version - cart version
 * @param {array} actions array of action
 * @param {string} action update action to be perfomed
 * @param {string} code discount code to ne appliedI
 */

const applyDiscountCode = async (req, res) => {
    try {
        const joiSchema = Joi.object({
            cartId: Joi.string().required(),
            version: Joi.number().required(),
            actions: Joi.array().items(Joi.object({
                action: Joi.string().required(),
                code: Joi.string().required()
            })).required()
        }).required()

        await joiSchema.validateAsync({ ...req.body })
        const discountCodeResponse = await discount.applyDiscountCode({ cartId: req.body.cartId, body: req.body })
        res.status(200).json({ ...discountCodeResponse.body })
    } catch (error) {
        res.status(400).json({ error })
    }
}

/**
 * remove  discount code
 *
 * @param {string} id - cart Id
 * @param {number} version - cart version
 * @param {array} actions array of action
 * @param {string} action update action to be perfomed
 * @param {string} code discount code to be removed
 */

const removeDiscountCode = async (req, res) => {
    try {
        const joiSchema = Joi.object({
            cartId: Joi.string().required(),
            version: Joi.number().required(),
            actions: Joi.array().items(Joi.object({
                action: Joi.string().required(),
                discountCode: Joi.object({
                    typeId: Joi.string().required(),
                    id: Joi.string().required()
                })
                // discountCode: Joi.string().required()
            })).required()
        }).required()
        await joiSchema.validateAsync({ ...req.body })
        const discountCodeResponse = await discount.removeDiscountCode({ cartId: req.body.cartId, body: req.body })
        res.status(200).json({ ...discountCodeResponse.body })
    } catch (error) {
        res.status(400).json({ error })
    }
}

module.exports = {
    getDiscountCodes,
    getCartDiscounts,
    applyDiscountCode,
    removeDiscountCode
}