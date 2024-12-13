'use strict'
const { Model } = require('sequelize')
const bcrypt = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      // A user can have many posts
      Users.hasMany(models.Posts, { foreignKey: 'userId' })

      // A user can have many comments
      Users.hasMany(models.Comments, { foreignKey: 'userId' })

      // A user can have many replies
      Users.hasMany(models.Replies, { foreignKey: 'userId' })
    }
  }

  Users.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false, // Ensure that username is not empty
        unique: true // Optional: ensure usernames are unique
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Optional: ensure emails are unique
        validate: {
          isEmail: true // Ensures that the email is in a valid format
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          if (value) {
            const hashpassword = bcrypt.hashSync(value, 10) // Synchronously hashes the password
            this.setDataValue('password', hashpassword)
          } else {
            throw new Error('Password cannot be null')
          }
        }
      },
      userimage: {
        type: DataTypes.STRING,
        allowNull: true
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
      paranoid: true, // Enables soft deletion using deletedAt field
      freezeTableName: true, // Prevents Sequelize from pluralizing the table name
      modelName: 'Users',
    }
  )

  return Users
}
