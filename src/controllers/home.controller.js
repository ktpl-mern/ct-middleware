const { get, findIndex } = require("lodash")
const { contentful } = require("../services")
const {
  getFilteredCategories,
  getFeatureProducts,
} = require("../services/commercetools/dashboard")

/**
 * get all data related to dynamic list
 *
 * 1. It wil get all list baed on id
 * 2. For product and category promise all will call apis and get data
 * 3. Match id with item sys id and add new data in field
 */
const getDynamicDashboard = async () => {
  try {
    const { fields: homeFields } = await contentful.getEntry("6pYOzZ1w7WBzbsrW9jpbMR", {
      include: 5,
    })
    const pageBlocks = get(homeFields, "blocks", [])

    const ctPromises = []
    pageBlocks.forEach((item) => {
      let contentType = get(item, "fields.type", "")
      if (contentType === "category") {
        ctPromises.push(
          getFilteredCategories(
            get(item, "fields.ctTopCategories", []),
            get(item, "sys.id", "")
          )
        )
      } else if (contentType === "product") {
        ctPromises.push(
          getFeatureProducts(
            get(item, "fields.ctFeatureProducts", []),
            get(item, "sys.id", "")
          )
        )
      }
    })
    const res = await Promise.all(ctPromises)

    let updatedPageBlock = pageBlocks.map((item) => {
      const matchedIndex = findIndex(res, (resItem) => resItem.id === item.sys.id)
      if (matchedIndex > -1) {
        // create new dat key and store relevant data there
        item.fields.data = res[matchedIndex].data
      }
      return item
    })
    return updatedPageBlock
  } catch (err) {
    return {}
  }
}

/**
 * Handler function for Home page
 * @param {object} req
 * @param {object} res
 */
const home = async (req, res) => {
  try {
    const fields = await getDynamicDashboard()

    res.status(200).json({
      blocks: fields,
    })
  } catch (err) {
    res.status(400).json({ message: err })
  }
}

exports.getDashboard = getDynamicDashboard
module.exports = home
