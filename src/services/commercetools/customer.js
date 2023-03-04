const { ClientResponse, CustomerSignInResult } = require("@commercetools/sdk-client-v2")
const { apiRoot } = require("../ctClient")

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
const authenticateCustomer = async ({ email, password, cartId }) => {
  const response = await apiRoot
    .login()
    .post({
      body: {
        email,
        password,
        anonymousCart: {
          id: cartId
        }
      },
    })
    .execute()
  return response
}

// authenticateCustomer({ email: 'john.doe870008@example.com', password: 'secret123', anonymousCartId: '9b701c9e-8fc8-4500-ac9b-1684252eab09' }).then(console.log).catch(console.error)

const checkCustomerExistence = async ({ email }) => {
  const response = await apiRoot
    .customers()
    .get({
      queryArgs: {
        where: `email="${email}"`,
      },
    })
    .execute()
  return response
}

const checkCustomerExistenceQuery = async ({ query }) => {
  const response = await apiRoot
    .customers()
    .get({
      queryArgs: query,
    })
    .execute()
  return response.body.results[0]
}

// checkCustomerExistencePhoneNumber({ phoneNumber: 8668448006 }).then(console.log)

const customerById = async ({ customerId }) => {
  const response = await apiRoot.customers().withId({ ID: customerId }).get().execute()
  return response
}

const updatePassword = async ({ body }) => {
  const response = await apiRoot
    .customers()
    .password()
    .post({
      body: body,
    })
    .execute()
  return response
}

const updateCustomerDetailsById = async ({ customerId, body }) => {
  const response = await apiRoot
    .customers()
    .withId({ ID: customerId })
    .post({
      body: body,
    })
    .execute()
  return response
}
/**
 *
 * Token Generate and send mail =>1
 * Send email to client with token
 */
const createPasswordToken = async ({ email }) => {
  const response = await apiRoot
    .customers()
    .passwordToken()
    .post({
      body: {
        email: email,
      },
    })
    .execute()
  return response
}
/**
 *
 * verify customer details via token
 */
const getCustomerByPasswordToken = async ({ token }) => {
  const response = await apiRoot
    .customers()
    .get({
      queryArgs: {
        token: token,
      },
    })
    .execute()
  return response
}
/**
 *
 * if verifed then client will call this to reset password
 */
const resetCustomerByPasswordToken = async ({ token, password, version }) => {
  const response = await apiRoot
    .customers()
    .passwordReset()
    .post({
      body: {
        tokenValue: token,
        newPassword: password,
        version: version,
      },
    })
    .execute()
  return response
}

module.exports = {
  createCustomer,
  authenticateCustomer,
  checkCustomerExistence,
  customerById,
  updatePassword,
  updateCustomerDetailsById,
  createPasswordToken,
  getCustomerByPasswordToken,
  resetCustomerByPasswordToken,
  checkCustomerExistenceQuery,
}
