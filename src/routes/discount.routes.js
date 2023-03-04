const {
    getCartDiscounts,
    getDiscountCodes,
    applyDiscountCode,
    removeDiscountCode

} = require("../controllers/discount.controller")

module.exports = function (app) {
    //API EndPoints
    // app.post("/me/checkout/placeOrder", placeOrder)
    app.get("/discount/cart-discounts", getCartDiscounts);
    app.get("/discount/discount-codes", getDiscountCodes);
    //update action to apply discount code to cart 
    app.put("/discount/apply", applyDiscountCode)
    //update action to remove discount code 
    app.put("/discount/remove", removeDiscountCode)

}