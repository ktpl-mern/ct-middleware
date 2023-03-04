const { apiRoot } = require("../ctClient")
const { size, get } = require("lodash")
/**
 * it will do the api call to get all categories
 * @param {string[]} ids list of top categories id
 */
async function getFilteredCategories(ids, id) {
  try {
    if (size(ids) === 0) return []
    const queryString = JSON.stringify(ids).replace(/\[/g, "(").replace(/]/g, ")")
    const res = await apiRoot
      .categories()
      .get({
        queryArgs: {
          where: `id in ${queryString}`,
        },
      })
      .execute()
    return Promise.resolve({
      id,
      data: get(res, "body.results", []),
    })
  } catch (err) {
    return Promise.reject()
  }
}

/**
 *
 * @param {*} ctFeatureProducts
 * @returns {Promise} promise to get products
 */
async function getFeatureProducts(productIds, id) {
  try {
    if (size(productIds) === 0) return []
    const queryString = JSON.stringify(productIds).replace(/\[/g, "(").replace(/]/g, ")")
    const res = await apiRoot
      .products()
      .get({
        queryArgs: {
          where: `masterData(current(masterVariant(sku in ${queryString})))`,
        },
      })
      .execute()
    return Promise.resolve({
      id,
      data: get(res, "body.results", []),
    })
  } catch (err) {
    return Promise.reject()
  }
}

module.exports = {
  getFilteredCategories,
  getFeatureProducts,
}
