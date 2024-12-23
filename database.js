require('dotenv').config({ path: `${process.cwd()}/.env` })

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  process.env.POSTGRES_NAME,
  process.env.POSTGRES_USERNAME,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, 
        rejectUnauthorized: false
      }
    }
  }
)

const connection = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

module.exports = { connection, sequelize }
