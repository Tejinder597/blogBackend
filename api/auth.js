const { connection } = require('./database')
const express = require('express')
const app = express()
const authRouter = require('../routes/authRoute')

app.use(express.json())
app.use('/api/v1/auth', authRouter)

module.exports = async (req, res) => {
    await connection();
    return app(req, res);
};