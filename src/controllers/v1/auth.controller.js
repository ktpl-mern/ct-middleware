const Joi = require("joi")
const { wishlist, customer, cart } = require("../../services/commercetools")
const { generateToken } = require("../../middleware/auth.middleware")
const { size, has, get } = require("lodash")
const { CART_CURRENCY } = require("../../constant")
const { verifyIdToken } = require("../../services/auth")

const signupTypes = ["mobile", "facebook", "google", "apple"]
const loginTypes = [...signupTypes, "email"]

/**
 * Create user in commercetools
 * @param {object} req
 * @param {object} res
 */
const signup = async (req, res) => {
    try {
        try {
            const joiSchema = Joi.object({
                firstName: Joi.string()
                    .min(3)
                    .when("type", { is: "mobile", then: Joi.required() }),
                lastName: Joi.string()
                    .min(3)
                    .when("type", { is: "mobile", then: Joi.required() }),
                email: Joi.string()
                    .email({ tlds: { allow: false } })
                    .when("type", { is: "mobile", then: Joi.required() }),
                password: Joi.string()
                    .min(8)
                    .when("type", { is: "mobile", then: Joi.required() }),
                type: Joi.string()
                    .valid(...signupTypes)
                    .required(),
                idToken: Joi.string().when("type", {
                    is: ["mobile", "facebook", "google", "apple"],
                    then: Joi.required(),
                }),
                cartId: Joi.string().optional(),
            })
            await joiSchema.validateAsync({
                ...req.body,
            })
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                success: false,
                message: "Error in creating customer!",
                description: error.message,
            })
        }
        const { type } = req.body
        // let token, customerData, cartObj, wishList
        let customerResponse
        // if (type == "email") customerResponse = await createCustomer({ ...req.body })
        if (type == "mobile") {
            //confirm mobile number is authenticated using token
            const tokenResponse = await verifyIdToken({
                idToken: req.body.idToken,
                userAuthenticationType: type,
            })
            const user = get(tokenResponse, "users[0]", null)
            //check phone number exist
            const query = {
                where: `custom(fields(customerPhoneNumber="${user.phoneNumber}"))`,
            }

            const phoneNumberExist = await customer.checkCustomerExistenceQuery({ query })
            if (phoneNumberExist)
                return res.status(409).json({ success: false, message: "duplicate phone number" })
            customerResponse = await createCustomer({
                ...req.body,
                phoneNumber: user.phoneNumber,
                uid: user.localId,
            })
        } else if (type == "google" || type == "facebook" || type == "apple") {
            //confirm token is valid
            const tokenResponse = await verifyIdToken({
                idToken: req.body.idToken,
                userAuthenticationType: type,
            })
            // customerResponse = await
            // const {users } = tokenResponse;
            const user = get(tokenResponse, "users[0]", null)
            // if (user == null)
            //   return res.status(400).json({ success: false, message: "Token not valid" })
            const { email, displayName, localId } = user
            customerResponse = await createCustomer({
                email,
                firstName: displayName.split(" ")[0],
                lastName: displayName.split(" ")[1],
                password: localId,
                uid: localId,
                type,
            })
        }

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            ...customerResponse,
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
                type: Joi.string()
                    .valid(...loginTypes)
                    .required(),
                email: Joi.string()
                    .email({ tlds: { allow: false } })
                    .when("type", { is: "email", then: Joi.required() }),
                password: Joi.string().min(8).when("type", { is: "email", then: Joi.required() }),
                cartId: Joi.string().empty(),
                // phoneNumber: Joi.number().when("type", { is: "mobile", then: Joi.required() }),
                // uid: Joi.string().when("type", { not: "email", then: Joi.required() }),
                idToken: Joi.string().when("type", {
                    is: ["mobile", "facebook", "google", "apple"],
                    then: Joi.required(),
                }),
            })
            await joiSchema.validateAsync({ ...req.body })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Error in login customer!",
                description: error.message,
            })
        }
        const { type, uid, idToken } = req.body

        let loginRes = {}
        if (type === "email") {
            const { body } = await customer.authenticateCustomer({ ...req.body })
            loginRes = body
        } else if (type === "mobile") {
            //verify Token
            const tokenResponse = await verifyIdToken({
                idToken: req.body.idToken,
                userAuthenticationType: type,
            })
            const user = get(tokenResponse, "users[0]", null)
            //authentication logic for mobile and uuid
            const query = {
                where: `custom(fields(customerPhoneNumber="${user.phoneNumber}"))`,
            }
            let authenticate = await customer.checkCustomerExistenceQuery({ query })
            if (!authenticate)
                return res
                    .status(400)
                    .json({ success: false, message: "invalid credentials account not found" })
            loginRes = authenticate
        } else if (type == "google" || type == "apple" || type == "facebook") {
            //confirm token is valid
            const tokenResponse = await verifyIdToken({
                idToken: idToken,
                userAuthenticationType: type,
            })

            const user = get(tokenResponse, "users[0]", null)

            const { displayName, localId } = user
            // we are getting email from user object for google
            // button email path is changed for facebook user object
            let email = ""
            if (type === "google") {
                email = get(user, "email", "")
            } else if (type === "facebook") {
                email = get(user, "providerUserInfo.0.email", "")
            }

            const query = {
                where: `email = "${email}"`,
            }
            let userExist = await customer.checkCustomerExistenceQuery({ query })
            if (!userExist) {
                // return res.status(404).json({ success: false, message: "account does not exist" })
                //create user
                const { customer } = await createCustomer({
                    email,
                    firstName: displayName.split(" ")[0],
                    lastName: displayName.split(" ")[1],
                    password: localId,
                    uid: localId,
                    type,
                })
                loginRes = customer
            } else {
                const authenticate = userExist.custom.fields.loginType === type
                if (!authenticate)
                    return res
                        .status(400)
                        .json({ message: "account already exist using diffrent provider" })
                loginRes = userExist
            }
        }
        const customerData = type === "email" ? get(loginRes, "customer", {}) : loginRes
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
            console.log("🚀 ~ file: auth.controller.js:259 ~ login ~ error", error)
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
        res.status(200).json({
            success: true,
            message: "Customer login successfully",
            token,
            customer: customerData,
            cart: cartObj,
            wishlist: userWishList,
        })
    } catch (err) {
        console.log("err:", err)
        res.status(400).json(err)
    }
}

const createCustomer = async ({
    firstName,
    lastName,
    email,
    password,
    phoneNumber = undefined,
    type,
    cartId = undefined,
    uid = undefined,
}) => {
    // const createCustomer = async ({ firstName = undefined, lastName = undefined, email = undefined, password = undefined, phoneNumber = undefined, uid = undefined, type = undefined, cartId = undefined }) => {
    try {
        console.log("type", type)
        // customer dataObj
        const dataObj = {
            body: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                custom: {
                    type: {
                        key: "social-login",
                        typeId: "type",
                    },
                    fields: {
                        customerPhoneNumber: phoneNumber ? phoneNumber : undefined,
                        uid: uid ? uid : "uniqueString",
                        loginType: type,
                    },
                },
            },
        }
        //merge cart with customer
        if (!!size(cartId)) {
            dataObj.body.anonymousCart = {
                id: cartId,
                typeId: "cart",
            }
        }
        const createCustomerRes = await customer.createCustomer(dataObj)
        const customerData = get(createCustomerRes.body, "customer", {})
        const token = await generateToken({ customerId: customerData.id })
        // check for cart as well if cart is not exist then create cart
        let cartObj = {}
        if (!has(createCustomerRes.body, "cart")) {
            const dataObj = {
                body: {
                    currency: CART_CURRENCY,
                    customerId: customerData.id,
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
            key: `${customerData.id}`,
            customer: {
                id: customerData.id,
            },
        }
        const wishList = await wishlist.createDefaultWishlist({
            body: DefaultWishlistDataObj,
        })

        return { token, wishlist: wishList, customer: customerData, cart: cartObj }
    } catch (error) {
        // throw new Error(error)
        return Promise.reject(error)
    }
}

// createCustomer({}).then(data => {
//   console.log("data")
//   console.log(data)
// }).catch(err => {
//   console.log("err")
//   console.error(err)
// })

module.exports = {
    signup,
    login,
}
