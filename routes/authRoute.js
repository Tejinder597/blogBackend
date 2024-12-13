const {
  signup,
  signin,
  upload,
  getUserProfile,
  updateUserProfile,
  verifyToken
} = require('../controllers/authController')
const router = require('express').Router()

router.route('/signup').post(upload.single('userimage'), signup)
router.route('/signin').post(signin)
router.route('/profile').get(verifyToken, getUserProfile)
router.route('/profile/update').put(verifyToken, updateUserProfile)
// router.post("/signup", signup);
// router.post("/signin",  signin);

module.exports = router
