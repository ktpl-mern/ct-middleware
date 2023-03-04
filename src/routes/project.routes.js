const { projectSetting } = require("../controllers/project.controller")

module.exports = function (app) {
    //API EndPoints
    app.get('/config', projectSetting)
}