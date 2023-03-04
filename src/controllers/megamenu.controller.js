const { get } = require("lodash")
const { contentful } = require("../services")

const megamenu = async (req, res) => {
  try {
    const { items } = await contentful.getEntries({
      content_type: "mainNavigation",
      include: 5,
    })
    res.status(200).json({
      success: true,
      message: "Mega Menu Details",
      megamenu: get(items, "0.fields", {}),
    })
  } catch (error) {
    res.status(400).json({ success: false, message: "Error in Mega Menu API" })
  }
}

module.exports = megamenu
