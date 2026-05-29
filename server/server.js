"use strict"
import express from "express"
const app = express()
const port = 8080

app.use((req, res, next) => {
    res.set("Cache-Control", "no-cache")
    next()
})

app.use(express.static("../src"))

app.listen(port, () => {
    console.log(`steam-recording-converter-dev-server listening on port ${port}`)
})