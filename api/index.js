require('dotenv').config({ path: `${process.cwd()}/.env` })
const cookieParser = require('cookie-parser')
const express = require('express')
const { connection } = require('./database')
var cors = require('cors')

const app = express()

// CORS Configuration
const corsOptions = {
  origin: process.env.BASE_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

// Middleware for CORS
app.use(cors(corsOptions))

// Ensure preflight OPTIONS requests are handled
// app.options('*', cors(corsOptions));

//Body Parsers
app.use(express.json())
app.use(cookieParser())

// Static files and All Routes here
app.use(express.static('uploads'))

// Catch-all route for unmatched paths
app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'failed',
    message: 'Route not found'
  })
})
module.exports = async (req, res) => {
  try {
      // Establish database connection
      await connection();

      // Handle CORS for preflight requests
      if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Origin', process.env.BASE_URL);
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.status(204).end();
          return;
      }

      // Test Route Response
      res.status(200).json({
          status: 'success',
          message: 'Blog API is working',
      });
  } catch (error) {
      // Handle Errors
      console.error('Error in index.js:', error);
      res.status(500).json({
          status: 'error',
          message: error.message || 'Something went wrong!',
      });
  }
};
