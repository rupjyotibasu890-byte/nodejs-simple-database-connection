const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// ✅ MySQL Connection (works locally & on Railway)
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "test",
  port: process.env.MYSQLPORT || 3306,
});

// ✅ Connect to DB
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database");

  // Ensure products table exists
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      price DECIMAL(10,2)
    )
  `;
  db.query(createTableQuery, (err) => {
    if (err) console.error("❌ Error creating products table:", err);
    else console.log("✅ Table 'products' is ready");
  });
});

// ✅ Homepage – List all products
app.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.render("index", { products: results });
  });
});

// ✅ Add a new product
app.post("/add", (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).send("Missing fields");
  db.query("INSERT INTO products (name, price) VALUES (?, ?)", [name, price], (err) => {
    if (err) return res.status(500).send("Database insert error");
    res.redirect("/");
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
