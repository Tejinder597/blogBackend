require('dotenv').config({ path: `${process.cwd()}/.env` })
const cookieParser = require('cookie-parser')
const express = require('express')
const authRouter = require('./routes/authRoute')
const publicRouter = require('./routes/publicRoute')
const { connection } = require('./database')
var cors = require('cors')

const app = express()

//Connect to db
connection()

// CORS Configuration
const corsOptions = {
  origin: process.env.BASE_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware for CORS
app.use(cors(corsOptions))

// Ensure preflight OPTIONS requests are handled
// app.options('*', cors(corsOptions));

//Body Parsers
app.use(express.json())
app.use(cookieParser())

// Test Route to verify the server
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Blog Api is working'
  })
})

// Static files and All Routes here
app.use(express.static('uploads'))
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/public', publicRouter)

// Global error handler (optional, good practice for production)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  })
})

// Catch-all route for unmatched paths
app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'failed',
    message: 'Route not found'
  })
})

// Start the server
app.listen(process.env.APP_PORT || 9000, () => {
  console.log(`Server up and running on Port ${process.env.APP_PORT}`)
})
