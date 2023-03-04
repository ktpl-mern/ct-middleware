const jwt = require("jsonwebtoken")
const { TOKEN_SECRET, TOKEN_EXPIRATION_TIME } = require("../config")
const { redisClient } = require("../services")

/**
 * Generate web token
 * @param {string} customerId
 * @returns {Promise<string>} token will be return
 */
const generateToken = async ({ customerId }) => {
  const token = jwt.sign({ customerId }, TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRATION_TIME.toString(),
  })
  await redisClient.set(customerId, token)
  return token
}

// midware to put token content into header
// put customerId from jwt to request header
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Please provide valid token!",
      })
    } else {
      const decoded = jwt.verify(token, TOKEN_SECRET)
      const customerId = decoded?.customerId
      req.headers.customerId = customerId
      req.headers.token = token
      if (!customerId) {
        res.status(401).json({
          success: false,
          message: "You are unauthorized!",
        })
      } else {
        const loginToken = await redisClient.get(customerId)
        if (token !== loginToken) {
          res.status(401).json({
            success: false,
            message: "Your session has been expired. Please re-login",
          })
        } else {
          return next()
        }
      }
    }
  } catch (err) {
    // JWT token catch will be handled here as its throwing error
    return res
      .status(401)
      .json({ message: "Your session has been expired. Please re-login" })
  }
}

module.exports = {
  authMiddleware,
  generateToken,
}
