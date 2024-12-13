'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    static associate (models) {
      // Associate Posts with Users (each post belongs to a user)
      Posts.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' })
      
      // Associate Posts with Likes (a post can have many likes)
      Posts.hasMany(models.Likes, { foreignKey: 'postId' })

      // Associate Posts with Comments (a post can have many comments)
      Posts.hasMany(models.Comments, { foreignKey: 'postId', as: 'comments' })

      // Associate Posts with Replies (a post can have many replies via comments)
      Posts.hasMany(models.Replies, { foreignKey: 'postId', as: 'replies' })
    }
  }

  Posts.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      files: {
        type: DataTypes.STRING
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        allowNull: false // Ensure userId cannot be null
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      deletedAt: {
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      paranoid: true, // Enables soft deletion via deletedAt field
      freezeTableName: true, // Prevents Sequelize from pluralizing table name
      modelName: 'Posts', // Model name for association
    }
  )

  return Posts
}
