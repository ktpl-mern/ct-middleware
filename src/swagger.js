const swaggerAutogen = require("swagger-autogen")()

const doc = {
  info: {
    title: "CT ACCELERATOR",
    description: "CT Accelerator Backend API",
  },
  host: "localhost:8080",
  schemes: ["http"],
  securityDefinitions: {
    BasicAuth: {
      type: "basic",
    },
  },
}

const outputFile = "./swagger_output.json"
const endpointsFiles = ["./routes/index.js"]

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./app.js")
})
