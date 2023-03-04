const Joi = require("joi")
const { category } = require("../services/commercetools")

/**
 * Get Category Details by Category Id
 * @param {string} id - Category Id
 */

const getCategoryById = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      id: Joi.string().empty().required(),
    })
    await joiSchema.validateAsync(req.params)
    try {
      const categoryRes = await category.categoryById({ categoryId: req.params.id })
      res.status(200).json({
        success: true,
        message: "Category Details By ID",
        categories: categoryRes.body,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in gettig category details!",
        description: error,
      })
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

/**
 * Get Category Details by Category Id
 * @param {string} key - Category Id
 */

const getCategoryByKey = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      key: Joi.string().empty().required(),
      expand: Joi.any(),
    })
    await joiSchema.validateAsync({
      key: req.params.key,
      expand: req.query.expand,
    })
    try {
      const categoryRes = await category.categoryByKey({
        categoryKey: req.params.key,
        expand: req.query.expand,
      })
      res.status(200).json(categoryRes.body)
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in gettig category details by key!",
        description: error,
      })
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}
/**
 * Get All Category Details
 * @param {string} limit - limit value to support pagination deafault is 20
 * @param {string} offset - offset value to support pagination default is 0
 */

const getAllCategory = async (req, res) => {
  try {
    const dataObj = { limit: req.query.limit, offset: req.query.offset }
    const categoriesRes = await category.listCategory(dataObj)
    res.status(200).json({
      success: true,
      message: "All Categories Details",
      categories: categoriesRes.body,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in gettig category details!",
      description: error,
    })
  }
}

module.exports = {
  getCategoryById,
  getAllCategory,
  getCategoryByKey,
}
