const { apiRoot } = require("../../ctClient")
let { CUSTOM_OBJECT_CONTAINER_NAME } = require("../../../config")

CUSTOM_OBJECT_CONTAINER_NAME = CUSTOM_OBJECT_CONTAINER_NAME || "brand-container"

const listCustomObjects = async ({ limit, offset }) => {
  const response = await apiRoot
    .customObjects()
    .withContainer({ container: CUSTOM_OBJECT_CONTAINER_NAME })
    .get({
      queryArgs: {
        limit: limit || 20,
        offset: offset || 0,
      },
    })
    .execute()
  return response
}

const listCustomObjectByKey = async ({ key }) => {
  const response = await apiRoot
    .customObjects()
    .withContainerAndKey({
      container: CUSTOM_OBJECT_CONTAINER_NAME,
      key,
    })
    .get()
    .execute()
  return response
}

module.exports = {
  listCustomObjects,
  listCustomObjectByKey,
}
