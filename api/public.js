const { connection } = require('./database')
const express = require('express')
const app = express()
const publicRouter = require('../routes/publicRoute')

app.use(express.json())
app.use('/api/v1/public', publicRouter)

module.exports = async (req, res) => {
    await connection();
    return app(req, res);
};