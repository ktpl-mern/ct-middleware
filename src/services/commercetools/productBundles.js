const { apiRoot } = require("../ctClient")

const createProductBundle = async ({ body }) => {
  const response = await apiRoot
    .productTypes()
    .post({
      body: body,
    })
    .execute()
  return response
}

const deleteProductBundleById = async ({ productTypeId, productTypeVersion }) => {
  const response = await apiRoot
    .productTypes()
    .withId({ ID: productTypeId })
    .delete({
      queryArgs: {
        version: productTypeVersion,
      },
    })
    .execute()
  return response
}

const getProductBundleById = async ({ productTypeId }) => {
  const response = await apiRoot
    .productTypes()
    .withId({ ID: productTypeId })
    .get()
    .execute()
  return response
}

const updateProductBundleById = async ({ productTypeId, body }) => {
  const response = await apiRoot
    .productTypes()
    .withId({ ID: productTypeId })
    .post({
      body: body,
    })
    .execute()
  return response
}

module.exports = {
  createProductBundle,
  deleteProductBundleById,
  getProductBundleById,
  updateProductBundleById,
}
