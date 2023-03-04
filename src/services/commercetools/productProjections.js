const { apiRoot } = require("../ctClient")

const searchProducts = async ({
  categoryIds,
  limit,
  offset,
  color,
  size,
  brand,
  price,
  sort,
}) => {
  const filters = []
  if (categoryIds) {
    filters.push(`categories.id:${categoryIds}`)
  }
  if (price) {
    filters.push(`variants.price.centAmount:range(${price.from} to ${price.to})`)
  }
  if (color) {
    filters.push(`variants.attributes.color.label.en:${color}`)
  }
  if (size) {
    filters.push(`variants.attributes.size:${size}`)
  }
  if (brand) {
    filters.push(`variants.attributes.brand:${brand}`)
  }
  console.log("filters ==============>", filters)

  // return apiRoot
  const data = await apiRoot
    .productProjections()
    .search()
    .get({
      queryArgs: {
        limit: limit || 20,
        offset: offset || 0,
        "filter.query": filters,
        facet: [
          "categories.id as categories counting products",
          "variants.price.centAmount as price counting products",
          "variants.attributes.size as size counting products",
          "variants.attributes.color.label.en as colors counting products",
          "variants.attributes.brand as brands counting products",
          "reviewRatingStatistics.averageRating:range (0 to 1), (1 to 2), (2 to 3), (3 to 4), (4 to 5) as reviews",
        ],
        expand: "facets.categories[*].id",
        sort: sort.sortingKey + " " + sort.sortingMethod,
      },
    })
    .execute()
  console.log(data.body.results)
  return data
}

const getProductFacets = async () => {
  const response = await apiRoot
    .productProjections()
    .search()
    .get({
      queryArgs: {
        facet: [
          "categories.id as Categories",
          "variants.price.centAmount as Price",
          "variants.attributes.size Size",
          "variants.attributes.color.label.en as Colors",
          "variants.attributes.brand as Brands",
        ],
        limit: 1,
      },
    })
    .execute()
  return response
}

const searchProductsByText = async ({ limit, offset, searchText }) => {
  const response = await apiRoot
    .productProjections()
    .search()
    .get({
      queryArgs: {
        "text.en": `${searchText}`,
        limit: limit || 20,
        offset: offset || 0,
        fuzzy: true,
        fuzzyLevel: 1,
      },
    })
    .execute()
  return response
}

const searchProductsByKey = async ({ productKey, queryString }) => {
  const response = await apiRoot
    .productProjections()
    .search()
    .get({
      queryArgs: {
        "filter.query": `variants.sku:"${productKey}"`,
        expand: queryString,
      },
    })
    .execute()
  console.log("response", response)
  return response
}

module.exports = {
  searchProducts,
  getProductFacets,
  searchProductsByText,
  searchProductsByKey,
}
