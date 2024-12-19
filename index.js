require('dotenv').config({ path: `${process.cwd()}/.env` })
const cookieParser = require('cookie-parser')
const express = require('express')
const authRouter = require('./routes/authRoute')
const publicRouter = require('./routes/publicRoute')
const { connection } = require('./database')
var cors = require('cors')

const app = express()

connection()

const corsOptions = {
  origin: process.env.BASE_URL,
  credentials: true,
};

app.use(express.json())
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Blog Api is working'
  })
})

//  all routes here
app.use(express.static('uploads'))
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/public', publicRouter)

const PORT = process.env.APP_PORT || 9000

// Global error handler (optional, good practice for production)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  })
})

app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'failed',
    message: 'Route not found'
  })
})

app.listen(process.env.APP_PORT, () => {
  console.log('Server up and running on Port', PORT)
})
