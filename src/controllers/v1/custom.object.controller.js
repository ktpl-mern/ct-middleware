const { customObject } = require("../../services/commercetools")

/**
 * Get All Brand Custom Objects
 * @param {string} limit - limit value to support pagination deafault is 20
 * @param {string} offset - offset value to support pagination default is 0
 */

const getAllBrand = async (req, res) => {
  try {
    const dataObj = { limit: req.query.limit, offset: req.query.offset }
    const brandResponse = await customObject.listCustomObjects(dataObj)
    let brandList = []
    brandResponse.body.results.forEach(function (items) {
      const obj = {
        id: items.id,
        version: items.version,
        createdAt: items.createdAt,
        lastModifiedAt: items.lastModifiedAt,
        container: items.container,
        key: items.key,
        value: items.value,
      }
      brandList.push(obj)
    })
    const brands = {
      limit: brandResponse.body.limit,
      offset: brandResponse.body.offset,
      total: brandResponse.body.total,
      brandList: brandList,
    }
    res.status(200).json({
      success: true,
      message: "Brand List",
      brands,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in gettig Brand List!",
      description: error,
    })
  }
}

/**
 * Get All Brand Custom Objects By Key
 * @param {string} key - key is passed from client side 
 */

const getBrandByKey = async (req, res) => {
  try {
    const response = await customObject.listCustomObjectByKey({ key: req.params.key })
    const brand = { ...response.body, createdBy: undefined, lastModifiedBy: undefined, versionModifiedAt: undefined }
    res.status(200).json({
      success: true,
      message: "Brand by Key",
      brand
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in gettig Brand By Key!",
      description: error,
    })
  }
}

module.exports = {
  getAllBrand,
  getBrandByKey
}
