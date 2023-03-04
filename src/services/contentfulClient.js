const contentful = require("contentful")
const { SPACE_ID, ACCESS_TOKEN } = require("../config")

let client = false
const getContentfulClient = () => {
  if (client) {
    return client
  }
  client = contentful.createClient({
    space: SPACE_ID,
    accessToken: ACCESS_TOKEN,
  })
  return client
}

module.exports = { getContentfulClient }
