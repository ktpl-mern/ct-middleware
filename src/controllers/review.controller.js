const Joi = require("joi")
const { get } = require("lodash")
const { review, product, states } = require("../services/commercetools")
const { logger } = require("../utils/logger")

/**
 * Get Product/Channel Review Details by id
 * @param {string} id - review id
 */
const getReviewById = async (req, res) => {
  try {
    try {
      const joiSchema = Joi.object({
        id: Joi.string().empty().required(),
      })
      await joiSchema.validateAsync(req.params)
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
    let reviewResponse = await review.getReviewById({
      reviewId: req.params.id,
    })
    res.status(200).json({
      success: true,
      message: "Review Details By ID",
      review: reviewResponse.body,
    })
  } catch (err) {
    res.status(400).json(err)
  }
}

/**
 * Create Product/Channel Review
 * @param {Object} req.body - Sent create product/channel review details as object in body
 * @param {string} req.body.productID // productID of the product the review is for
 * @param {number} req.body.rating // rating for the product between 1 to 5
 * @param {string} req.body.title // title of the rating
 * @param {string} req.body.text //text for the rating
 */

const createReview = async (req, res) => {
  const joiSchema = Joi.object({
    productID: Joi.string().required(),
    rating: Joi.number().min(1).max(5),
    title: Joi.string().required(),
    text: Joi.string().required(),
    authorName: Joi.string().required(),
  })
  try {
    await joiSchema.validateAsync(req.body)
    const reviewResponse = await review.createReview({
      ...req.body,
      customerID: req.headers.customerId,
    })
    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review: reviewResponse.body,
    })
  } catch (error) {
    res.status(400).json(error)
  }
}

/**
 * update Product/channel review by id
 * @param {string} id - review id
 */

const updateReviewById = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      id: Joi.string().empty().required(),
    })
    await joiSchema.validateAsync(req.params)
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
  try {
    const dataObj = {
      reviewId: req.params.id,
      body: req.body,
    }
    console.log("dataObj", dataObj)
    const reviewResponse = await review.updateReviewById(dataObj)
    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: reviewResponse.body,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in updating review details!",
      description: error,
    })
  }
}

/**
 * delete Product/Channel Review by review Id, review Version
 * @param {string} id - review id
 *  * @param {string} reviewVersion - review version
 */

const deleteReviewById = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      reviewVersion: Joi.string().empty().required(),
    })
    await joiSchema.validateAsync(req.query)
    try {
      const reviewResponse = await review.deleteReviewById({
        reviewId: req.params.id,
        reviewVersion: req.query.reviewVersion,
      })
      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
        review: reviewResponse.body,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in deleting review!",
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
 * Get All Product/Channel Review Details
 * @param {string} limit - limit value to support pagination deafault is 20
 * @param {string} offset - offset value to support pagination default is 0
 * @param {boolean} expand - expand flag  to expand product details if its
 */
const getAllReviews = async (req, res) => {
  try {
    const expand = get(req.query, "expand", false)
    let queryArgs = {
      limit: req.query.limit || 10,
      offset: req.query.offset || 0,
      sort: "lastModifiedAt desc",
    }
    if (expand) {
      queryArgs.expand = "target.product[*].id"
    }
    let reviewResponse = await review.getAllReviewByQuery(queryArgs)
    res.status(200).json({
      success: true,
      message: "Review Details!",
      review: reviewResponse.body,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in gettig review details!",
      description: error,
    })
  }
}

/**
 * Get All Product/Channel Review Details
 * @param {string} limit - limit value to support pagination deafault is 20
 * @param {string} offset - offset value to support pagination default is 0
 * @param {boolean} expand - expand flag  to expand product details if its
 */
const getProductReviews = async (req, res) => {
  try {
    //Get Approved Review Status
    const stateResponse = await states.getStateByKey()
    logger.info(stateResponse)
    const approvedReviewStateId = stateResponse.body.id
    let queryArgs = {
      limit: req.query.limit || 10,
      offset: req.query.offset || 0, // state id is approved state TODO :- Show only approved state review
      where: `target(id = "${req.params.id}") and state(id = "${approvedReviewStateId}")`,
      sort: "lastModifiedAt desc",
    }
    const reviewResponse = await review.getAllReviewByQuery(queryArgs)
    const productResponse = await product.productById({ productId: req.params.id })
    res.status(200).json({
      success: true,
      message: "Review Details!",
      review: reviewResponse.body,
      reviewRatingStatistics: get(productResponse, "body.reviewRatingStatistics", null),
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in gettig review details!",
      description: error,
    })
  }
}

const myReviews = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      limit: Joi.number(),
      offset: Joi.number(),
    })

    await joiSchema.validateAsync(req.query)
    let queryArgs = {
      limit: req.query.limit || 10,
      offset: req.query.offset || 0,
      where: `customer(id = "${req.headers.customerId}")`,
      expand: `target`,
      expand: `state`,
      sort: "lastModifiedAt desc",
    }

    const reviews = await review.getAllReviewByQuery(queryArgs)
    res.status(200).json({
      success: true,
      message: "Review Details!",
      review: reviews.body,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in getting my reviews",
      description: error,
    })
  }
}
module.exports = {
  getReviewById,
  createReview,
  updateReviewById,
  deleteReviewById,
  getAllReviews,
  getProductReviews,
  myReviews,
}
