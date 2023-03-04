const Joi = require("joi")
const { product, productProjection, category } = require("../../services/commercetools")

const { get, has, size } = require("lodash")
const { logger } = require("../../utils/logger")
const {
  getStructuredFilters,
  getCategoryBreadcrumbs,
  getProductsWithConfiurableOptions,
} = require("../../utils/product.utils")

/**
 * Get All Product Details
 * @param {string} limit - limit value to support pagination deafault is 20
 * @param {string} offset - offset value to support pagination default is 0
 */

const getAllProducts = async (req, res) => {
  try {
    const dataObj = {
      limit: req.query.limit,
      offset: req.query.offset,
      expand: req.query.expand,
    }
    const productRes = await product.listProduct(dataObj)
    res.status(200).json({
      success: true,
      message: "All Products Details",
      products: productRes.body.results,
      total: get(productRes, "body.total", 0),
    })
  } catch (error) {
    logger.error(error)
    res.status(400).json({
      success: false,
      message: "Error in gettig category details!",
      description: error,
    })
  }
}

/**
 * Search products by Filters - PLP
 * @param {array} category_ids - List of category ids
 * @param {number} price.from - Min/From value of price
 * @param {number} price.to - Max/to value of price
 * @param {array} color - List of color value
 * @param {array} size - List of size value
 * @param {string} limit - limit value to support pagination deafault is 20
 * @param {string} offset - offset value to support pagination default is 0
 */

const serachProductsByFilter = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      filters: Joi.object({
        category_ids: Joi.array(),
        price: Joi.object({
          from: Joi.string(),
          to: Joi.string(),
        }),
        color: Joi.array(),
        size: Joi.array(),
        brand: Joi.array(),
        sort: Joi.object({
          sortingKey: Joi.string(),
          sortingMethod: Joi.string(),
        }),
      }),
      limit: Joi.string().empty(),
      offset: Joi.string().empty(),
    })
    await joiSchema.validateAsync(req.query)
  } catch (error) {
    logger.error(error)
    res.status(400).json({
      success: false,
      message: "Error in gettig search product details!",
      description: error,
    })
  }
  try {
    let categoryKey = req.params.categoryKey
    let categoryIds = get(req.query, "filters.category_ids", [])
    let color = get(req.query, "filters.color", "")
    let size = get(req.query, "filters.size", "")
    let price = get(req.query, "filters.price", { from: 0, to: 50000 })
    let brand = get(req.query, "filters.brand", "")
    let sort = get(req.query, "filters.sort", {
      sortingKey: "createdAt",
      sortingMethod: "asc",
    })
    let category_ids = []
    //Fetch Category Ids from category key if categoryIds is empty
    if (categoryIds.length === 0) {
      let categoryRes = await category.categoryByKey({ categoryKey: categoryKey })
      categoryIds.push(categoryRes.body.id)
    }
    categoryIds.forEach(function (id) {
      category_ids.push(`subtree("${id}")`)
    })

    const dataObj = {
      categoryIds: category_ids,
      limit: Number(req.query.limit),
      offset: Number(req.query.offset),
      color: color,
      size: size,
      brand,
      price,
      sort,
    }

    const apiRes = await Promise.all([
      productProjection.searchProducts(dataObj),
      category.getExpandedCategoryByIdV1(categoryIds[0]),
    ])

    //Format product Filter Options
    let filters = []
    let products = []
    if (apiRes[0].body.results.length !== 0) {
      filters = await getStructuredFilters(apiRes[0].body.facets)
      console.log(
        "🚀 ~ file: product.controller.js:128 ~ serachProductsByFilter ~ filters",
        filters
      )
      products = await getProductsWithConfiurableOptions(apiRes[0].body.results)
      console.log(
        "🚀 ~ file: product.controller.js:133 ~ serachProductsByFilter ~ products",
        products
      )
      apiRes[0].body.results = products
    }

    console.log("====>", apiRes[0].body.results)
    res.status(200).json({
      success: true,
      message: "Search Product Details",
      products: apiRes[0].body,
      filters: filters,
      category: getCategoryBreadcrumbs(apiRes[1].body),
    })
  } catch (err) {
    logger.error(err)
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

/**
 * Search products by search text
 * @param {string} searchText - text to be search
 * @param {string} limit - limit value to support pagination deafault is 20
 * @param {string} offset - offset value to support pagination default is 0
 */
const serachProductsByText = async (req, res) => {
  try {
    try {
      const joiSchema = Joi.object({
        searchText: Joi.string().min(3).required(),
        limit: Joi.number().empty(),
        offset: Joi.number().empty().optional(),
      })
      await joiSchema.validateAsync(req.query)
    } catch (error) {
      logger.error(error)
      res.status(400).json({
        success: false,
        message: "Error in gettig search product details!",
        description: error,
      })
    }
    const dataObj = {
      searchText: req.query.searchText,
    }
    const productRes = await productProjection.searchProductsByText(dataObj)
    res.status(200).json({
      success: true,
      message: "Search Product Details",
      products: productRes.body,
    })
  } catch (err) {
    logger.error(err)
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

/**
 * Get Configurable product By product ID
 * @param {string} id - productId
 */
const getConfigurableProduct = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      productId: Joi.string().empty().required(),
    })
    await joiSchema.validateAsync(req.body)
  } catch (err) {
    logger.error(err)
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
  try {
    const dataObj = { productId: req.body.productId, color: req.body.color }
    let configurable_product_options = []
    const productRes = await product.listConfigurableProduct(dataObj)
    let productVariants = productRes.body.masterData.current.variants

    productVariants.forEach(function (items) {})

    res.status(200).json({
      success: true,
      message: "Product Details By ID",
      products: productVariants,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in gettig product details!",
      description: error,
    })
  }
}

/**
 * Get Product By product Key
 * @param {string} key - productKey
 */
const getProductsByKey = async (req, res) => {
  try {
    try {
      const joiSchema = Joi.object({
        key: Joi.string().required(),
        expand: Joi.boolean().empty(),
      })
      await joiSchema.validateAsync({
        key: req.params.key,
        expand: req.query.expand,
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error in gettig product details!",
        description: error,
      })
    }
    // const expandQuery = {
    //   expand: "masterData.current.categories[*].parent",
    // }
    const expandQuery = "categories[*].parent"
    const queryString = get(req.query, "expand", false) ? expandQuery : null
    const dataObj = {
      productKey: req.params.key,
      queryString: queryString,
    }
    // const categoryId = get(req, "query.c", "")
    const categoryKey = get(req, "query.categoryKey", "")
    console.log(categoryKey)
    let apiRes = null

    // if category id not exist then dont call category api
    // category will not set when it is called from search
    if (!!size(categoryKey)) {
      apiRes = await Promise.all([
        // product.productById(dataObj),
        // product.productByKey(dataObj),
        productProjection.searchProductsByKey(dataObj),
        category.getExpandedCategoryByKey({ categoryKey }),
      ])
    } else {
      apiRes = await Promise.all([productProjection.searchProductsByKey(dataObj)])
    }

    let productRes = null
    let categoryRes = null

    apiRes.map((res) => {
      if (has(res, "body.ancestors")) {
        categoryRes = res
      } else {
        productRes = res
      }
    })

    const breadcrumbs = getCategoryBreadcrumbs(get(categoryRes, "body", {}))

    console.log(breadcrumbs)

    productRes = await getProductsWithConfiurableOptions(productRes.body.results)

    res.status(200).json({
      success: true,
      message: "Product Details By Key",
      products: productRes[0],
      breadcrumbs,
    })
  } catch (err) {
    logger.error(err)
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

module.exports = {
  getProductsByKey,
  getAllProducts,
  serachProductsByFilter,
  // getProductsFilters,
  serachProductsByText,
  getConfigurableProduct,
}
