// db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.mysql.railway.internal || "localhost",
  user: process.env.root || "root",
  password: process.env.CmbKPbEJCbmyjoDpsImxQLFGIRejRrSC|| "",
  database: process.env. railway|| "test",
  port: process.env.MYSQLPORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL database");

  // Create the table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL
    )
  `;
  db.query(createTableQuery, (err) => {
    if (err) console.error("❌ Error creating table:", err);
    else console.log("✅ Table 'products' is ready");
  });
});

module.exports = db;
