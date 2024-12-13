'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Likes extends Model {
    static associate (models) {
      Likes.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' })
      Likes.belongsTo(models.Posts, { foreignKey: 'postId', as: 'post' })
    }
  }

  Likes.init(
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
        },
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
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
      modelName: 'Likes',
      freezeTableName: true,
      indexes: [
        {
          unique: true,
          fields: ['postId', 'userId']
        }
      ]
    }
  )

  return Likes
}
