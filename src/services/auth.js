const { ClientResponse, CustomerSignInResult } = require("@commercetools/sdk-client-v2")
const { apiRoot } = require("./ctClient")
const { apiCall } = require("../utils/common")
const { FIREBASE_API_KEY } = require("../config/app")
const { get } = require("lodash")

/**
 * SDK call to create user
 * @param {SingupRequest} body - data to create user
 * @typedef {object} SingupRequest
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} password
 * @returns {Promise<ClientResponse<CustomerSignInResult>>} - response by commercetools after creating user
 */
const createCustomer = async ({ body }) => {
  const response = await apiRoot
    .customers()
    .post({
      body: body,
    })
    .execute()
  return response
}

/**
 * SDK call to login user
 * @param {LoginRequest} body - data that required to authenticate user
 * @typedef {object} LoginRequest
 * @property {string} email - email of user
 * @property {string} password - password of the user
 * @returns {Promise<ClientResponse<CustomerSignInResult>>} - response by commercetools
 */
const authenticateCustomer = async ({ body }) => {
  const response = await apiRoot
    .login()
    .post({
      body: body,
    })
    .execute()
  return response
}

//userAuthecnticationType can be [mobile,facebook,] 
const verifyIdToken = async ({ idToken, userAuthenticationType }) => {
  const responseIdToken = await apiCall({
    headers: { "Content-Type": "application/json" },
    method: 'POST',
    data: { idToken: idToken }, url: `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`
  })
  const provider = get(responseIdToken, 'users[0].providerUserInfo[0].providerId')
  switch (userAuthenticationType) {
    case "mobile":
      return provider == "phone" ? responseIdToken : Promise.reject("token not valid");
    case "facebook":
      return provider === "facebook.com" ? responseIdToken : Promise.reject("token not valid");
    case "google":
      return provider == "google.com" ? responseIdToken : Promise.reject("token not valid");
    default:
      return Promise.reject("Invalid user authentication type");
  }
}
module.exports = {
  createCustomer,
  authenticateCustomer,
  verifyIdToken,
}
