const { Users } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const multer = require('multer')

const generateToken = (userId, userName) => {
  return jwt.sign(
    { id: userId, username: userName },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  )
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token) {
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.decode = decode
    req.user = {
      id: decode.id,
      username: decode.username
    }
    next()
  } else {
    res.json({
      login: false,
      data: 'user is not logged in'
    })
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
  }
})

// signUp functionality
const signup = async (req, res, next) => {
  try {
    const body = req.body
    if (
      !body.username ||
      !body.email ||
      !body.password ||
      !body.confirmpassword
    ) {
      return res.status(400).json({
        status: 'failed',
        message:
          'All fields are required: username, email, password, and confirmPassword'
      })
    }

    if (body.password !== body.confirmpassword) {
      return res.status(400).json({
        status: 'failed',
        message: 'Passwords do not match'
      })
    }

    const userImage = req.file ? req.file.filename : null

    const newUser = await Users.create({
      username: body.username,
      email: body.email,
      userimage: userImage,
      password: body.password,
      confirmpassword: body.confirmpassword
    })

    const result = newUser.toJSON()
    delete result.password
    delete result.deletedAt

    if (!result) {
      return res.status(400).json({
        status: 'failed',
        message: 'Failed to create the user'
      })
    }

    return res.status(201).json({
      status: 'success',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// signIn functionality
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        status: 'failed',
        message: 'please provide email and password'
      })
    }
    const result = await Users.findOne({ where: { email } })
    if (!result || !(await bcrypt.compare(password, result.password))) {
      return res.status(401).json({
        status: 'failed',
        message: 'Incorrect email or password'
      })
    }

    const token = generateToken(result.id, result.username)

    res.cookie('token', token)

    return res.json({
      status: 'success',
      data: {
        id: result.id,
        username: result.username,
        email: result.email
      },
      token
    })
  } catch (error) {
    next(error)
  }
}

// Get User Profile functionality
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id

    const user = await Users.findOne({
      where: { id: userId },
      attributes: ['id', 'username', 'email', 'userimage']
    })

    if (!user) {
      return res.status(404).json({
        status: 'failed',
        message: 'User not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        userimage: user.userimage ? user.userimage : null
      }
    })
  } catch (error) {
    next(error)
  }
}

// update user profile
const updateUserProfile = async (req, res, next) => {
  try {
    upload.single('userimage')(req, res, async err => {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({
          status: 'error',
          message: 'Multer error occurred',
          error: err.message
        })
      } else if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'An unknown error occurred',
          error: err.message
        })
      }

      const { username } = req.body
      const { file } = req
      const user = await Users.findOne({ where: { id: req.user.id } })

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        })
      }
      const updateData = {}
      if (username) {
        updateData.username = username
      }
      if (file) {
        updateData.userimage = file.filename
      }
      await user.update(updateData)

      const updatedUser = await Users.findOne({
        attributes: ['id', 'username', 'email', 'userimage'],
        where: { id: req.user.id }
      })

      return res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: updatedUser
      })
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  signup,
  signin,
  verifyToken,
  upload,
  getUserProfile,
  updateUserProfile
}
