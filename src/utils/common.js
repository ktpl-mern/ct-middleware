const fetch = require("node-fetch")

const apiCall = async ({ method, url, data, headers, params }) => {
    try {
        const response = await fetch(url, {
            method: method,
            body: JSON.stringify(data),
            headers: headers,
            params: params
        })
        return await response.json()
    } catch (error) {
        return error
    }
}

module.exports = {
    apiCall
}