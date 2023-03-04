const nodemailer = require("nodemailer")
const {
  NODEMAILER_HOST,
  NODEMAILER_PASSWORD,
  NODEMAILER_USERNAME,
} = require("../../config")

const sendEmail = async ({ msg }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: NODEMAILER_HOST,
      auth: {
        user: NODEMAILER_USERNAME,
        pass: NODEMAILER_PASSWORD,
      },
    })
    const response = await transporter.sendMail(msg)
    return response
  } catch (error) {
    return error
  }
}

module.exports = {
  sendEmail,
}
