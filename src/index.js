// require('dotenv').config()
import express from "express"
import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config();
connectDB()

const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}!`)
  })