const { apiRoot } = require("../../ctClient")
let { REVIEW_APPROVED_STATE_KEY } = require("../../../config")

const getStateByKey = async () => {
  REVIEW_APPROVED_STATE_KEY = undefined || "approved-review"
  const response = await apiRoot
    .states()
    .withKey({ key: REVIEW_APPROVED_STATE_KEY })
    .get()
    .execute()
  return response
}

module.exports = {
  getStateByKey,
}
