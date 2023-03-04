const { apiRoot, projectKey } = require("./ctClient")
const { getContentfulClient } = require("./contentfulClient")
const { createCustomer, authenticateCustomer } = require("./auth")
const { sendEmail } = require("./mail/nodemailer")
const { redisConnection, redisClient } = require("./redis")

module.exports = {
  apiRoot,
  contentful: getContentfulClient(),
  projectKey,
  createCustomer,
  authenticateCustomer,
  sendEmail,
  redisConnection,
  redisClient,
}
