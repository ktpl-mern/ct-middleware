const { get, size, flatMap, isEqual, uniqWith } = require("lodash")
const { category } = require("../services/commercetools")

/**
 * restructe facets to proper ways for filter such as
 * { label, code , option}
 * @param {object} productFilters
 * @returns {Array}
 */
const getStructuredFilters = async (productFilters) => {
  const filters = []
  let options = []
  let categoryObj = {}
  let colorObj = {}
  let sizeObj = {}
  let priceObj = {}
  let manufacturerObj = {}
  //Configure Category response
  if (!!size(get(productFilters, "categories.terms", []))) {
    let categories = get(productFilters, "categories")
    const categoryIds = flatMap(categories.terms, (item) => item.term)
    const queryString = JSON.stringify(categoryIds).replace(/\[/g, "(").replace(/]/g, ")")
    const categoryListRes = await category.listCategoryByQuery({
      queryString: queryString,
    })
    categories.terms.forEach(function (categoryItems) {
      categoryListRes.body.results.forEach(function (items) {
        if (categoryItems.term === items.id) {
          const obj = {
            label: items.name.en,
            id: items.id,
            value: items.id,
            count: categoryItems.productCount,
          }
          options.push(obj)
        }
      })
      categoryObj.label = "Category"
      categoryObj.code = "category_ids"
      categoryObj.options = options
    })
    filters.push(categoryObj)
  }
  options = []
  let price = []
  //Configure Price Filters
  if (!!size(get(productFilters, "price.terms", []))) {
    let priceData = get(productFilters, "price")

    priceData.terms.forEach(function (priceItems) {
      price.push(priceItems.term)
    })
    const obj = {
      label: Math.min(...price) + "-" + Math.max(...price),
      from: Math.min(...price),
      to: Math.max(...price),
    }
    priceObj.label = "Price"
    priceObj.code = "price"
    options.push(obj)
    priceObj.options = options
    filters.push(priceObj)
  }
  options = []
  //Configure Size Filters

  if (!!size(get(productFilters, "size.terms", []))) {
    let sizeData = get(productFilters, "size")

    sizeData.terms.forEach(function (sizeItems) {
      const obj = {
        label: sizeItems.term,
        value: sizeItems.term,
        count: sizeItems.productCount,
      }
      sizeObj.label = "Size"
      sizeObj.code = "size"
      options.push(obj)
    })
    sizeObj.options = options
    filters.push(sizeObj)
  }
  options = []
  //Configure manufacturer Filters
  if (!!size(get(productFilters, "brands.terms", []))) {
    let manufacturersData = get(productFilters, "brands")

    manufacturersData.terms.forEach(function (manufacturerItems) {
      const obj = {
        label: manufacturerItems.term,
        value: manufacturerItems.term,
        count: manufacturerItems.productCount,
      }
      manufacturerObj.label = "Brands"
      manufacturerObj.code = "brands"
      options.push(obj)
    })
    manufacturerObj.options = options
    filters.push(manufacturerObj)
  }
  options = []
  //Configure Color Filters
  if (!!size(get(productFilters, "colors.terms", []))) {
    let colorData = get(productFilters, "colors")

    colorData.terms.forEach(function (colorItems) {
      const obj = {
        label: colorItems.term,
        value: colorItems.term,
        count: colorItems.productCount,
      }
      colorObj.label = "Color"
      colorObj.code = "color"
      options.push(obj)
    })
    colorObj.options = options
    filters.push(colorObj)
  }
  return filters
}

/**
 * get category structure in breadcrumbs and normal category name
 */
const getCategoryBreadcrumbs = (category) => {
  let breadcrumbs = []
  if (!!size(category.ancestors)) {
    breadcrumbs = category.ancestors.map((item) => ({
      id: get(item, "obj.id", ""),
      name: get(item, "obj.name.en", ""),
      key: get(item, "obj.key", ""),
    }))
  }
  return {
    id: get(category, "id", ""),
    name: get(category, "name.en", ""),
    key: get(category, "key", ""),
    breadcrumbs,
    custom: get(category, "custom", {}),
  }
}

const toEUR = (cent) => {
  return cent * 0.01
}

/**
 * Create Configurable Product Options
 * { attribute_code, value , label}
 * @param {object} products
 * @returns {Array}
 */

const getProductsWithConfiurableOptions = async (products) => {
  products.forEach(function (productItems) {
    let productsWithConfiguration = []
    let sizeOptions = []
    let colorOptions = []
    let colorObj = {}
    let sizeObj = {}
    productItems.variants.forEach(function (productVariantItems) {
      productVariantItems.attributes.forEach(function (attributes) {
        if (isEqual(attributes.name, "size")) {
          const obj = {
            label: attributes.value,
            value: attributes.value,
          }
          sizeObj.attribute_code = "size"
          sizeObj.label = "size"
          sizeOptions.push(obj)
          sizeObj.options = sizeOptions
        } else if (isEqual(attributes.name, "color")) {
          //Product Configuration Color
          const obj = {
            label: attributes.value.label,
            value: attributes.value,
          }
          colorObj.attribute_code = "color"
          colorObj.label = "color"
          colorOptions.push(obj)
          colorObj.options = colorOptions
        }
      })
    })

    if (isEqual(sizeObj.attribute_code, "size")) {
      sizeObj.options = uniqWith(sizeObj.options, isEqual)
    } else {
      sizeObj.attribute_code = "size"
      sizeObj.options = []
    }

    if (isEqual(colorObj.attribute_code, "color")) {
      colorObj.options = uniqWith(colorObj.options, isEqual)
    } else {
      colorObj.attribute_code = "color"
      colorObj.options = []
    }

    if (sizeObj.options.length > 0) {
      productsWithConfiguration.push(sizeObj)
    }
    if (colorObj.options.length > 0) {
      productsWithConfiguration.push(colorObj)
    }
    productItems.productConfigurationOptions = productsWithConfiguration
  })
  return Promise.resolve(products)
}

/**
 * Update Cart LineItems Products variant attributes based in product configuration options
 * @param {Array} lineItems
 * @returns {Array} lineItems
 */

const updateProductVariantAttributesBasedOnConfig = async (lineItems) => {
  if (lineItems.length != 0) {
    lineItems.forEach(function (products) {
      if (products.variant.attributes.length != 0) {
        let attributes = []
        products.variant.attributes.forEach(function (attribute) {
          if (isEqual(attribute.name, "size")) {
            attributes.push(attribute)
          }
          if (isEqual(attribute.name, "color")) {
            attributes.push(attribute)
          }
        })
        products.variant.attributes = attributes
      }
    })
  }
  return lineItems
}

module.exports = {
  getStructuredFilters,
  getCategoryBreadcrumbs,
  toEUR,
  getProductsWithConfiurableOptions,
  updateProductVariantAttributesBasedOnConfig,
}
