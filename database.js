require('dotenv').config({ path: `${process.cwd()}/.env` })

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  "postgresql://blogapi_ftoi_user:AYAPGxQwJCIaRyseFNMuMkEVFLX0OQbL@dpg-ctkom2jqf0us739kpt60-a.oregon-postgres.render.com/blogapi_ftoi",
  {
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
