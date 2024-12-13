const multer = require('multer')
const { Users, Likes, Posts, Comments, Replies } = require('../models')
const fs = require('fs')

// multer configuration for storing images starts
// Img storage config
var imgConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads')
  },
  filename: (req, file, callback) => {
    callback(null, `image-${Date.now()}.${file.originalname}`)
  }
})

// Image filter
const isImage = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true)
  } else {
    callback(new Error('Only image files are allowed'), false)
  }
}

var upload = multer({
  storage: imgConfig,
  fileFilter: isImage,
  limits: { fileSize: 5 * 1024 * 1024 }
})
// multer configuration for storing images ends

// create posts functionality starts
const createPost = async (req, res, next) => {
  upload.single('file')(req, res, async err => {
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

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload an image file'
      })
    }

    const { title } = req.body
    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a title for the post'
      })
    }

    const existingPost = await Posts.findOne({
      where: { title: title, userId: req.user.id }
    })

    if (existingPost) {
      return res.status(400).json({
        status: 'error',
        message: 'Post with this title already exists'
      })
    }

    const user = await Users.findOne({
      attributes: ['id', 'username'],
      where: { id: req.user.id }
    })

    const post = await Posts.create({
      title: title,
      files: req.file.filename,
      userId: user.id,
      userName: user.username
    })

    return res.status(201).json({
      status: 'success',
      message: 'Post uploaded successfully',
      data: post
    })
  })
}
// create posts functionality ends

// get allposts functionality starts
const getAllPosts = async (req, res, next) => {
  try {
    const getData = await Posts.findAll({
      include: [
        {
          model: Comments,
          as: 'comments',
          required: false,
          attributes: ['id', 'comment', 'createdAt'],
          include: [
            {
              model: Users,
              as: 'user',
              attributes: ['id', 'username', 'email', 'userimage']
            },
            {
              model: Replies,
              as: 'replies',
              required: false,
              attributes: ['id', 'reply', 'createdAt'],
              include: [
                {
                  model: Users,
                  as: 'user',
                  attributes: ['id', 'username', 'email', 'userimage']
                }
              ]
            }
          ]
        },
        {
          model: Likes,
          as: 'Likes',
          required: false,
          attributes: ['id', 'createdAt'],
          include: [
            {
              model: Users,
              as: 'user',
              attributes: ['id', 'username', 'email', 'userimage']
            }
          ]
        },
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'username', 'email', 'userimage']
        }
      ]
    })

    const formattedData = await Promise.all(
      getData.map(async post => {
        const likes = post.Likes
        const sortedLikes = likes.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
        const firstLiker = sortedLikes[0]
        let likescount = 0
        if (likes.length > 1) {
          likescount = likes.length - 1
        }
        const firstLikerDetails = firstLiker
          ? {
            username: firstLiker.user.username,
            userimage: firstLiker.user.userimage
              ? firstLiker.user.userimage
              : null
          }
          : null
        return {
          ...post.toJSON(),
          first_liker: firstLikerDetails,
          likescount
        }
      })
    )
    res.status(200).json({
      status: 'success',
      message: 'All posts retrieved successfully',
      data: formattedData
    })
  } catch (error) {
    next(error)
  }
}
// get allposts functionality ends

// get user's posts functionality starts
const getOwnPosts = async (req, res, next) => {
  try {
    const userPosts = await Posts.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Comments,
          as: 'comments',
          required: false,
          attributes: ['id', 'comment', 'createdAt'],
          include: [
            {
              model: Users,
              as: 'user',
              attributes: ['id', 'username', 'email', 'userimage']
            },
            {
              model: Replies,
              as: 'replies',
              required: false,
              attributes: ['id', 'reply', 'createdAt'],
              include: [
                {
                  model: Users,
                  as: 'user',
                  attributes: ['id', 'username', 'email', 'userimage']
                }
              ]
            }
          ]
        },
        {
          model: Likes,
          as: 'Likes',
          required: false,
          attributes: ['id', 'createdAt'],
          include: [
            {
              model: Users,
              as: 'user',
              attributes: ['id', 'username', 'email', 'userimage']
            }
          ]
        },
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'username', 'email', 'userimage']
        }
      ]
    })

    const formattedData = await Promise.all(
      userPosts.map(async post => {
        const likes = post.Likes
        const sortedLikes = likes.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
        const firstLiker = sortedLikes[0]
        let likescount = 0
        if (likes.length > 1) {
          likescount = likes.length - 1
        }
        const firstLikerDetails = firstLiker
          ? {
            username: firstLiker.user.username,
            userimage: firstLiker.user.userimage
              ? firstLiker.user.userimage
              : null
          }
          : null
        return {
          ...post.toJSON(),
          first_liker: firstLikerDetails,
          likescount
        }
      })
    )
    res.status(200).json({
      status: 'success',
      message: "user's posts retrieved successfully",
      data: formattedData
    })
  } catch (error) {
    next(error)
  }
}
// get user's posts functionality ends

// update post functionality starts
const updatePost = async (req, res, next) => {
  const uploadSingle = upload.single('file')
  uploadSingle(req, res, async err => {
    try {
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
      const { postId, title } = req.body
      if (!postId) {
        return res.status(400).json({
          status: 'error',
          message: 'Post ID is required'
        })
      }
      const post = await Posts.findOne({
        where: { id: postId, userId: req.user.id }
      })
      if (!post) {
        return res.status(404).json({
          status: 'error',
          message:
            'Post not found or you are not authorized to update this post'
        })
      }
      if (title) {
        post.title = title
      }
      if (req.file) {
        if (post.files) {
          const oldFilePath = `./uploads/${post.files}`
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath)
          }
        }
        post.files = req.file.filename
      }
      await post.save()
      res.status(200).json({
        status: 'success',
        message: 'Post updated successfully',
        data: post
      })
    } catch (error) {
      next(error)
    }
  })
}
// update post functionality ends

// delete post funstionality starts
const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.body

    if (!postId) {
      return res.status(400).json({
        status: 'error',
        message: 'Post ID is required'
      })
    }

    const post = await Posts.findOne({
      where: {
        id: postId,
        userId: req.user.id
      }
    })

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found or you are not authorized to delete this post'
      })
    }

    const postData = {
      id: post.id,
      title: post.title,
      content: post.content,
      files: post.files,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }

    if (post.files) {
      const oldFilePath = `./uploads/${post.files}`
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }
    }

    await post.destroy({ force: true })

    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully',
      data: postData
    })
  } catch (error) {
    next(error)
  }
}
// delete post funstionality ends

// create likes functionality starts
const createLike = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      attributes: ['id', 'username'],
      where: { id: req.user.id }
    })
    const { postId } = req.body

    if (!postId) {
      return res.status(400).json({
        status: 'error',
        message: 'postId is required'
      })
    }

    const existingLike = await Likes.findOne({
      where: {
        postId: postId,
        userId: user.id
      }
    })

    if (existingLike) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already liked this post'
      })
    } else {
      await Likes.create({
        postId: postId,
        userId: user.id,
        userName: user.username
      })
      return res.status(200).json({
        status: 'success',
        message: 'Liked successfully'
      })
    }
  } catch (error) {
    next(error)
  }
}
// create likes functionality starts

// delete likes functionality starts
const deleteLike = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      attributes: ['id', 'username'],
      where: { id: req.user.id }
    })
    const { postId } = req.body

    if (!postId) {
      return res.status(400).json({
        status: 'error',
        message: 'postId is required'
      })
    }

    const existingLike = await Likes.findOne({
      where: {
        postId: postId,
        userId: user.id
      }
    })

    if (!existingLike) {
      return res.status(400).json({
        status: 'error',
        message: 'You have not liked this post yet'
      })
    } else {
      await existingLike.destroy()
      return res.status(200).json({
        status: 'success',
        message: 'Disliked successfully'
      })
    }
  } catch (error) {
    next(error)
  }
}
// delete likes functionality starts

// create comments functionality starts
const createComments = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      attributes: ['id', 'username', 'userimage'],
      where: { id: req.user.id }
    })

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    const { postId, comment } = req.body

    if (!postId || !comment) {
      return res.status(400).json({
        status: 'error',
        message: 'Post ID and comment text are required'
      })
    }

    const newComment = await Comments.create({
      postId,
      userId: user.id,
      userName: user.username,
      comment
    })

    res.status(201).json({
      status: 'success',
      data: {
        id: newComment.id,
        postId: newComment.postId,
        comment: newComment.comment,
        createdAt: newComment.createdAt,
        user: {
          id: user.id,
          username: user.username,
          userimage: user.userimage
        }
      },
      message: 'Comment created successfully'
    })
  } catch (error) {
    next(error)
  }
}
// create comments functionality ends

// create replies functionality starts
const createReplies = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      attributes: ['id', 'username', 'userimage'],
      where: { id: req.user.id }
    })

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    const { postId, commentId, reply } = req.body

    if (!commentId || !reply) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment ID and reply text are required'
      })
    }

    // Find the comment that is being replied to
    const comment = await Comments.findOne({
      where: { id: commentId }
    })

    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      })
    }

    const newReply = await Replies.create({
      postId,
      commentId,
      userId: user.id,
      userName: user.username,
      reply
    })

    res.status(201).json({
      status: 'success',
      data: {
        id: newReply.id,
        commentId: newReply.commentId,
        reply: newReply.reply,
        createdAt: newReply.createdAt,
        user: {
          id: user.id,
          username: user.username,
          userimage: user.userimage
        }
      },
      message: 'Reply created successfully'
    })
  } catch (error) {
    next(error)
  }
}
// create replies functionality starts

module.exports = {
  createLike,
  deleteLike,
  createComments,
  createReplies,
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getOwnPosts
}
