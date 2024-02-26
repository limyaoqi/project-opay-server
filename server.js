const express = require("express")
const app = express()
require("dotenv").config()
const {PORT} = process.env
const cors = require("cors")
const connectDB = require("./connection")

connectDB()
app.use(cors())
app.use(express.json());
app.use(express.static("public"));
app.use("/users",require("./controllers/users"))
app.use("/products",require("./controllers/products"))
app.use("/likes",require("./controllers/likes"))
app.use("/comments",require("./controllers/comments"))
app.use("/carts",require("./controllers/carts"))
app.use("/orders",require("./controllers/orders"))
app.use("/follows",require("./controllers/follows"))
app.listen(PORT,console.log(`App is running on PORT:${PORT}`))