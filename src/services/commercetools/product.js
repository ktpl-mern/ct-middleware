const { apiRoot } = require("../ctClient")

const productById = async ({ productId, queryString }) => {
  return await apiRoot
    .products()
    .withId({ ID: productId })
    .get({
      queryArgs: queryString,
    })
    .execute()
}

const productByKey = async ({ productKey, queryString }) => {
  return await apiRoot.products()
    .withKey({
      key: productKey
    })
    .get({
      queryArgs: queryString
    }).execute()
}

const listProduct = async ({ limit, offset, expand, where = null }) => {
  let queryArgs = {
    limit: limit || 10,
    offset: offset || 0,
    where
  }
  if (expand) {
    queryArgs.expand = "masterData.current.categories[*].parent"
  }
  const response = await apiRoot
    .products()
    .get({
      queryArgs: queryArgs,
    })
    .execute()
  return response
}

const listProductByQuery = async ({ queryString }) => {
  const response = await apiRoot
    .products()
    .get({
      queryArgs: {
        where: `id in ${queryString}`,
      },
    })
    .execute()
  return response
}

const productsFilter = async ({ ids, limit, offset, sort }) => {
  const response = await apiRoot
    .products()
    .get({
      queryArgs: {
        where: `id in ${ids}`,
        limit: limit || 10,
        offset: offset || 0,
        sort: sort,
      },
    })
    .execute()
  return response
}

const listConfigurableProduct = async ({ productId }) => {
  const response = await apiRoot.products().withId({ ID: productId }).get().execute()
  return response
}

module.exports = {
  productById,
  productByKey,
  listProduct,
  listProductByQuery,
  productsFilter,
  listConfigurableProduct
}
