const {
  ClientBuilder,
  createAuthForClientCredentialsFlow,
  createHttpClient,
} = require("@commercetools/sdk-client-v2")
const { createApiBuilderFromCtpClient } = require("@commercetools/platform-sdk")
const fetch = require("node-fetch")
const {
  CTP_PROJECT_KEY,
  CTP_AUTH_URL,
  CTP_CLIENT_ID,
  CTP_CLIENT_SECRET,
  CTP_API_URL,
} = require("../config")

const projectKey = CTP_PROJECT_KEY

const authMiddlewareOptions = {
  host: CTP_AUTH_URL,
  projectKey,
  credentials: {
    clientId: CTP_CLIENT_ID || "",
    clientSecret: CTP_CLIENT_SECRET || "",
  },
  oauthUri: process.env.adminAuthUrl || "",
  scopes: [`manage_project:${projectKey}`],
  fetch,
}

const httpMiddlewareOptions = {
  host: CTP_API_URL,
  fetch,
}

const client = new ClientBuilder()
  .withProjectKey(projectKey)
  .withMiddleware(createAuthForClientCredentialsFlow(authMiddlewareOptions))
  .withMiddleware(createHttpClient(httpMiddlewareOptions))
  .withUserAgentMiddleware()
  .build()

const _apiRoot = createApiBuilderFromCtpClient(client)
const apiRoot = _apiRoot.withProjectKey({ projectKey })

module.exports = {
  apiRoot,
  projectKey,
}
