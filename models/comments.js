'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    static associate (models) {
      Comments.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' })
      Comments.belongsTo(models.Posts, { foreignKey: 'postId', as: 'post' })
      Comments.hasMany(models.Replies, {
        foreignKey: 'commentId',
        as: 'replies'
      })
    }
  }

  Comments.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      postId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Posts',
          key: 'id'
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      comment: {
        type: DataTypes.STRING
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
      paranoid: true,
      freezeTableName: true,
      modelName: 'Comments'
    }
  )

  return Comments
}
