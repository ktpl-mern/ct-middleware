const Joi = require("joi")
const { customer, cart } = require("../services/commercetools")
const { sendEmail } = require("../services")
const { get } = require("lodash")
const { readFile } = require("fs/promises")
const { API_HOST_URL, EMAIL_FROM_ADDRESS } = require("../config")
const { redisClient } = require("../services")
const { CART_CURRENCY } = require("../constant")
const { logger } = require("../utils/logger")

/**
 * Check customer exitence based on email
 * @param {string} email - email id of the customer
 */

const isCustomerExist = async (req, res) => {
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
                message: "Didn't find customer with given email!",
                description: error,
            })
        }
        const dataObj = { email: req.body.email }
        const customerRes = await customer.checkCustomerExistence(dataObj)
        res.status(200).json({
            success: true,
            emailExist: get(customerRes.body, "count", 0) === 1,
            customerRes: customerRes,
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        })
    }
}

/**
 * forgot password
 * @param {string} email - email id of the customer
 */

const forgotPassword = async (req, res) => {
    try {
        const joiSchema = Joi.object({
            email: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
        })
        await joiSchema.validateAsync({ email: req.body.email })
        //check customer existence to CT
        const customerRes = await customer.checkCustomerExistence({ email: req.body.email })
        const emailExist = get(customerRes.body, "count", 0) === 1
        if (emailExist) {
            const passwordTokenRes = await customer.createPasswordToken({
                email: req.body.email,
            })
            //Email Send
            const emailTemplateContent = await readFile(
                "src/services/mail/emailTemplate.html",
                "utf-8"
            )
            //TODO :- Need to replace this url with password reset url which we can send on mail
            const resetPasswordAPI =
                API_HOST_URL + "/account/resetpassword?t=" + btoa(passwordTokenRes.body.value)

            const emailTemplate = emailTemplateContent
                .toString()
                .replace('href=""', 'href="' + resetPasswordAPI + '"')
            const msg = {
                to: req.body.email,
                from: EMAIL_FROM_ADDRESS, // Use the email address or domain you verified above
                subject: "Forgot Password",
                html: emailTemplate,
            }
            const emailRes = await sendEmail({ msg: msg })
            res.status(200).json({
                token: btoa(passwordTokenRes.body.value),
                emailRes: emailRes,
            })
        } else {
            res.status(200).json({
                message: "Didn't find customer with given email!",
            })
        }
    } catch (error) {
        logger.error(error)
        res.status(400).json(error)
    }
}


/**
 * Call when user logging out
 *
 * User sessoin will be cleared.
 * New guest card wil be created
 *
 * @param {object} req
 * @param {object} res
 */

const logout = async (req, res) => {
    try {
        const customerId = get(req, "headers.customerId", "")
        if (customerId) {
            try {
                await redisClient.set(customerId, "")
            } catch (err) { }
        }
        // create guest cart as user is logged out
        const dataObj = {
            body: {
                currency: CART_CURRENCY,
            },
        }
        cartResponse = await cart.createCart(dataObj)
        res.status(200).json({
            success: true,
            message: "Successfully Logout!",
            cart: cartResponse.body,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Issue while logout!",
            description: error,
        })
    }
}

module.exports = {
    isCustomerExist,
    forgotPassword,
    resetPassword,
    logout,
}
