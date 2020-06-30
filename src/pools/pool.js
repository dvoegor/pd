const mysql = require("mysql2");
const pool = mysql.createPool({
    host: "fb7915xs.beget.tech",
    user: "fb7915xs_grisha",
    database: "fb7915xs_grisha",
    password: "J8C1%e4K"
});

module.exports = pool
