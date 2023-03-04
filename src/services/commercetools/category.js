const { size } = require("lodash")
const { apiRoot } = require("../ctClient")

const categoryById = async ({ categoryId }) => {
  const response = await apiRoot.categories().withId({ ID: categoryId }).get().execute()
  return response
}

const categoryByKey = async ({ categoryKey, expand }) => {
  const response = await apiRoot
    .categories()
    .withKey({ key: categoryKey })
    .get({
      queryArgs: {
        expand,
      },
    })
    .execute()
  return response
}

const listCategory = async ({ limit, offset }) => {
  const response = await apiRoot
    .categories()
    .get({
      queryArgs: {
        limit: limit || 10,
        offset: offset || 0,
      },
    })
    .execute()
  return response
}

const listCategoryByQuery = async ({ queryString }) => {
  return apiRoot
    .categories()
    .get({
      queryArgs: {
        where: `id in ${queryString}`,
        limit: 200,
      },
    })
    .execute()
}

/**
 * get category details with expanded ancestor so that we can get path based on id
 * @param {string} id - category id
 * @returns {Promise}
 */
const getExpandedCategoryById = async (id) => {
  return apiRoot
    .categories()
    .withId({ ID: id })
    .get({ queryArgs: { expand: "ancestors[*].name" } })
    .execute()
}

/**
 * get category details with expanded ancestor so that we can get path based on id
 * @param {string} id - category id
 * @returns {Promise}
 */
const getExpandedCategoryByIdV1 = async (id) => {
  return apiRoot
    .categories()
    .withId({ ID: id })
    .get({
      queryArgs: {
        expand: [
          "custom.fields.topCategoryCollection[*]",
          "custom.fields.topProductCollection[*]",
          "ancestors[*].name",
        ],
      },
    })
    .execute()
}

const getExpandedCategoryByKey = async ({ categoryKey }) => {
  return apiRoot
    .categories()
    .withKey({ key: categoryKey })
    .get({ queryArgs: { expand: "ancestors[*].name" } })
    .execute()
}

module.exports = {
  categoryById,
  categoryByKey,
  listCategory,
  listCategoryByQuery,
  getExpandedCategoryById,
  getExpandedCategoryByKey,
  getExpandedCategoryByIdV1,
}
