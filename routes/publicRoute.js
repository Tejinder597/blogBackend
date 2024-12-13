const { verifyToken } = require('../controllers/authController')

const {
  createLike,
  deleteLike,
  createComments,
  createReplies,
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getOwnPosts
} = require('../controllers/publicController')

const router = require('express').Router()

router.route('/postlike').post(verifyToken, createLike)
router.route('/deletelike').delete(verifyToken, deleteLike)
router.route('/postcomment').post(verifyToken, createComments)
router.route('/postreply').post(verifyToken, createReplies)
router.route('/postblog').post(verifyToken, createPost)
router.route('/updateblog').put(verifyToken, updatePost)
router.route('/deleteblog').delete(verifyToken, deletePost)
router.route('/getblogs').get(verifyToken, getAllPosts)
router.route('/getownblogs').get(verifyToken, getOwnPosts)
// router.route("/posts").post(posts);

module.exports = router
