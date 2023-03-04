const express = require("express")
const path = require("path")
const graphql = require("graphql")
const { ApolloServer, gql } = require("apollo-server-express")
const schema = require("./schema")
const cors = require("cors")
const { PORT, LOCAL_PORT } = require("./config")
const { redisConnection } = require("./services")
const swaggerUi = require("swagger-ui-express")
const swaggerFile = require("./swagger_output.json")

const app = express()
app.use(
  cors({
    preflightContinue: false,
  })
)

// const apolloServer = new ApolloServer({
//   schema: schema,
//   csrfPrevention: true,
//   introspection: true,
// })

app.use(express.json())
app.use(express.static("public"))

app.use("/apidoc", swaggerUi.serve, swaggerUi.setup(swaggerFile))

require("./routes/index")(app)

const port = PORT || LOCAL_PORT
// apolloServer.start().then(() => {
//   apolloServer.applyMiddleware({ app })

//   app.listen(port, async () => {
//     await redisConnection()
//     console.log(`Listening on ${port}...`)
//   })
// })

app.listen(port, async () => {
  await redisConnection()
  console.log(`Listening on ${port}...`)
})
