const { apiRoot } = require("../ctClient")

/**
 * it will do the api call to list Discount Codes
 * @param {number} limit limit the number of records
 * @param {number} offset offset (skip) the number of records
 */

const listDiscountCodes = async ({ limit, offset }) => {
    return await apiRoot.discountCodes().get({
        queryArgs: {
            limit: limit || 10,
            offset: offset || 0,
        },
    }).execute();
}

/**
 * it will do the api call to list CartDiscount Codes
 * @param {number} limit limit the number of records
 * @param {number} offset offset (skip) the number of records
 */

const listCartDiscount = async ({ limit, offset }) => {
    return await apiRoot.cartDiscounts().get({
        queryArgs: {
            limit: limit || 10,
            offset: offset || 0,
        }
    }).execute();
}

// apply discount code to cart
const applyDiscountCode = async ({ cartId, body }) => {
    return await apiRoot
        .carts()
        .withId({ ID: cartId })
        .post({
            body: body
        }).execute()
}
//remove discount code to cart
const removeDiscountCode = async ({ cartId, body }) => {
    return await apiRoot.carts().withId({ ID: cartId }).post({ body: body }).execute()
}

module.exports = {
    listDiscountCodes,
    listCartDiscount,
    applyDiscountCode,
    removeDiscountCode
} 