const { apiRoot } = require("../ctClient")

const createReview = async ({ title, text, productID, customerID, rating, authorName }) => {
  const body = {
    title: title,
    text,
    authorName,
    target: {
      typeId: "product",
      id: productID
    },
    customer: {
      typeId: "customer",
      id: customerID
    },
    rating: rating,
    uniquenessValue: `${productID + '-' + customerID}`, // unique value helps to create only one review per product for a customer
    state: {
      key: "to-approve"   //initial state of the review
    } //remove comments to start diffrent states
  }
  const response = await apiRoot
    .reviews()
    .post({
      body: body,
    })
    .execute()
  return response
}

const deleteReviewById = async ({ reviewId, reviewVersion }) => {
  const response = await apiRoot
    .reviews()
    .withId({ ID: reviewId })
    .delete({
      queryArgs: {
        version: reviewVersion,
      },
    })
    .execute()
  return response
}

const getReviewById = async ({ reviewId }) => {
  const response = await apiRoot.reviews().withId({ ID: reviewId }).get().execute()
  return response
}

const updateReviewById = async ({ reviewId, body }) => {
  const response = await apiRoot
    .reviews()
    .withId({ ID: reviewId })
    .post({
      body: body,
    })
    .execute()
  return response
}

const getAllReviewByQuery = async (queryArgs) => {
  const response = await apiRoot
    .reviews()
    .get({
      queryArgs: queryArgs,
    })
    .execute()
  return response
}

const reviewValidate = async (reviewId, customerId) => {
  const { body: { results: [valid] } } = await apiRoot.reviews().get({
    queryArgs: {
      where: `id = "${reviewId}" and customer(id = "${customerId}")`
    }
  }).execute()
}

module.exports = {
  createReview,
  deleteReviewById,
  getReviewById,
  updateReviewById,
  getAllReviewByQuery,
  reviewValidate
}
