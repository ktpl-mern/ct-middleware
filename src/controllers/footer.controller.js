const { contentful } = require("../services")

// router.get("/footer", async (req, res) => {
//   try {
//     const items = await contentful.getEntry("49npZqQSklmPs4onL5EaUz")
//     res.status(200).json({
//       success: true,
//       message: "Footer Details",
//       footer: items,
//     })
//   } catch (error) {
//     res
//       .status(400)
//       .json({ success: false, message: "Error while fethcing footer details!" })
//   }
// })

const footer = async (req, res) => {
  try {
    const items = await contentful.getEntry("49npZqQSklmPs4onL5EaUz")
    res.status(200).json({
      success: true,
      message: "Footer Details",
      footer: items,
    })
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Error while fethcing footer details!" })
  }
}

module.exports = footer
