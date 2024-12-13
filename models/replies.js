'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Replies extends Model {
    static associate (models) {
      // Associate Replies with Users (a reply is made by a user)
      Replies.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' })

      // Associate Replies with Posts (a reply is related to a post)
      Replies.belongsTo(models.Posts, { foreignKey: 'postId', as: 'post' })

      // Associate Replies with Comments (a reply is made to a comment)
      Replies.belongsTo(models.Comments, {
        foreignKey: 'commentId',
        as: 'comment'
      })
    }
  }

  Replies.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        allowNull: false
      },
      postId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Posts',
          key: 'id'
        },
      },
      commentId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Comments',
          key: 'id'
        },
        allowNull: false
      },
      reply: {
        type: DataTypes.STRING,
        allowNull: false
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
      paranoid: true, // Enables soft deletion (will use the deletedAt field)
      freezeTableName: true, // Prevents automatic pluralization of table name
      modelName: 'Replies',
    }
  )

  return Replies
}
