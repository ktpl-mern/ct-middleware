const { project } = require("../services/commercetools")

const projectSetting = async (req, res) => {
    try {
        //project setting response 
        const { body } = await project.projectSetting();
        res.status(200).json(body)

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports = {
    projectSetting
}