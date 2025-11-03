import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ Create MySQL connection (Railway provides these automatically)
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

// ✅ Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");

  // Create table if not exists
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

// ✅ Routes
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching products");
    }
    res.json(results);
  });
});

app.post("/products", (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).send("Missing fields");
  const sql = "INSERT INTO products (name, price) VALUES (?, ?)";
  db.query(sql, [name, price], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error adding product");
    }
    res.send("✅ Product added successfully");
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
