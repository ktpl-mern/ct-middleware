const redis = require("redis")
const { REDIS_HOST, REDIS_PORT } = require("../config")
const redisClient = redis.createClient(REDIS_HOST, REDIS_PORT)

const redisConnection = async () => {
  try {
    redisClient.on("error", (err) => {
      console.log("Redis Client Error", err)
    })
    redisClient.on("connect", (e) => {
      console.log("Successfully established redis connection")
    })
    await redisClient.connect()
  } catch (error) {
    console.log("redis connect error", error)
  }
}

// const save = async (key, value) => {
//   try {
//     await client.set(key, value)
//   } catch (error) {
//     return error
//   }
// }

// const fetch = async (key) => {
//   try {
//     const data = await client.get(key)
//     console.log("data", data)
//     return data
//   } catch (error) {
//     return error
//   }
// }

module.exports = {
  redisConnection,
  redisClient,
}
