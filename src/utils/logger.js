const { transports, createLogger, format } = require("winston")

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [new transports.Console()],
})

module.exports = {
  logger,
}
