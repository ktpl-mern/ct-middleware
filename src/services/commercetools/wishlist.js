const { apiRoot } = require("../ctClient")
const { size, flatMap, get, find } = require("lodash")
const { listProductByQuery } = require("./product")

/**
 * get main Wishlist as we are only providing single wishlist
 */
const getMainWishlist = async ({ key, customerId }) => {
  const response = await apiRoot
    .shoppingLists()
    .withKey({
      key: key,
    })
    .get({
      queryArgs: {
        customerId: customerId,
      },
    })
    .execute()
  const resWithProducts = await mergeProductInfoWithWishlist(response.body)
  return resWithProducts
}

/**
 * it will create default wishlist
 */
const createDefaultWishlist = async ({ body }) => {
  const response = await apiRoot
    .shoppingLists()
    .post({
      body: body,
    })
    .execute()
  const resWithProducts = await mergeProductInfoWithWishlist(response.body)
  return resWithProducts
}

/**
 * add products to wishlist
 * @param {string} wishlistId - id of specific wishlist
 * @param {{
 *   version: number,
 *  actions: AddItems[]
 * }} [data] - it should have action addLineItem in actions
 *
 * @typedef {Object} AddItems - object which will give action type and related info
 * @property {"addLineItem"} action - operation action on wishlist,
 * @property {string} productId - id of the product
 * @property {number} quantity - quantity of the product
 */
const addProductsToWishlist = async (wishlistId, data) => {
  const list = await apiRoot
    .shoppingLists()
    .withId({ ID: wishlistId })
    .post({
      body: data,
    })
    .execute()
  const resWithProducts = await mergeProductInfoWithWishlist(list.body)

  return resWithProducts
}

/**
 * remove products from the wishlist
 * @param {string} wishlistId - id of specific wishlist
 * @param {{
 *   version: number,
 *  actions: Items[]
 * }} [data] {@link Items}
 */
const removeProductFromWishlist = async (wishlistId, data) => {
  const list = await apiRoot
    .shoppingLists()
    .withId({ ID: wishlistId })
    .post({ body: data })
    .execute()
  const resWithProducts = await mergeProductInfoWithWishlist(list.body)

  return resWithProducts
}

/**
 * update qty in wishlist
 * @param {string} wishlistId - id of specific wishlist
 * @param {RequestData} data
 */
const updateWishlistItemQty = async (wishlistId, data) => {
  const list = await apiRoot
    .shoppingLists()
    .withId({ ID: wishlistId })
    .post({ body: data })
    .execute()
  const resWithProducts = await mergeProductInfoWithWishlist(list.body)

  return resWithProducts
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
const moveToBag = async (
  customerId,
  wishlistId,
  { version, productId, lineItemId, quantity }
) => {
  // get customer cart
  const cartRes = await apiRoot.carts().withCustomerId({ customerId }).get().execute()
  const addCartRes = await apiRoot
    .carts()
    .withId({ ID: cartRes.body.id })
    .post({
      body: {
        version: cartRes.body.version,
        actions: [{ action: "addLineItem", productId, quantity }],
      },
    })
    .execute()
  const updateWishlist = await removeProductFromWishlist(wishlistId, {
    version,
    actions: [{ action: "removeLineItem", lineItemId }],
  })
  return {
    cart: { ...addCartRes.body },
    wishlist: updateWishlist,
  }
}

/**
 * param wishlist => object of main wishlist
 * create product id array
 * get products based on array
 * merge product info to wishlist (restructuing)
 */
const mergeProductInfoWithWishlist = async (wishlist) => {
  if (!size(wishlist.lineItems)) return Promise.resolve(wishlist)
  // create array of product ids
  const productIds = flatMap(wishlist.lineItems, (item) => item.productId)

  // get product list based on ids
  const queryString = JSON.stringify(productIds).replace(/\[/g, "(").replace(/]/g, ")")

  const productListRes = await listProductByQuery({ queryString: queryString })
  // create new product object in wishlist line items
  const lineItems = get(wishlist, "lineItems", [])
  const updateListItems = []
  lineItems.forEach((item, index) => {
    const matchedObject = find(productListRes.body.results, ["id", item.productId])
    if (!!size(matchedObject)) {
      updateListItems.push({
        ...item,
        product: {
          id: get(matchedObject, "id", ""),
          version: get(matchedObject, "version", ""),
          price: get(matchedObject, "masterData.current.masterVariant.prices[0]", {}),
          slug: get(matchedObject, "masterData.current.slug", {}),
          sku: get(matchedObject, "masterData.current.masterVariant.sku", {}),
          images: get(matchedObject, "masterData.current.masterVariant.images", {}),
        },
      })
    } else {
      updateListItems.push({
        ...item,
      })
    }
  })
  return Promise.resolve({ ...wishlist, lineItems: updateListItems })
}

const deleteWishlist = async ({ shoppingListId, shoppingListVersion }) => {
  return await apiRoot.shoppingLists().withId({ ID: shoppingListId }).delete({
    queryArgs: {
      version: shoppingListVersion
    }
  }).execute()

}

// deleteWishlist({ shoppingListId: "d1fdf8a1-3be6-43e5-bda2-b527d0e81f8d", shoppingListVersion: 1 }).then((data) => console.log(data)).catch((err) => console.log(err))

module.exports = {
  getMainWishlist,
  createDefaultWishlist,
  addProductsToWishlist,
  removeProductFromWishlist,
  updateWishlistItemQty,
  moveToBag,
  deleteWishlist
}
