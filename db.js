require("dotenv").config();
const Pool = require("pg").Pool;

const sql = new Pool({
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.DBPORT,
  database: process.env.DATABASE,
});
module.exports = sql;
