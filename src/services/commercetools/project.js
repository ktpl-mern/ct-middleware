const { apiRoot } = require("../ctClient")

const projectSetting = async () => {
    return await apiRoot.get().execute()
}

module.exports = {
    projectSetting
}