import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// ✅ MySQL Connection (Railway + Local fallback)
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "test",
  port: process.env.MYSQLPORT || 3306,
});

// ✅ Ensure `products` table exists and has initial data
(async () => {
  const connection = await pool.getConnection();
  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL
    )
  `);

  // Insert sample data only if table empty
  const [rows] = await connection.query("SELECT COUNT(*) AS count FROM products");
  if (rows[0].count === 0) {
    await connection.query(`
      INSERT INTO products (name, price) VALUES
      ('Laptop', 55000),
      ('Mobile', 20000),
      ('Headphones', 2500),
      ('Smartwatch', 4500),
      ('Camera', 32000)
    `);
    console.log("🟢 Sample products added!");
  }

  connection.release();
})();

// ✅ Homepage — Show all products
app.get("/", async (req, res) => {
  const [products] = await pool.query("SELECT * FROM products");
  res.render("index", { products });
});

// ✅ Add new product
app.post("/add", async (req, res) => {
  const { name, price } = req.body;
  if (name && price) {
    await pool.query("INSERT INTO products (name, price) VALUES (?, ?)", [name, price]);
  }
  res.redirect("/");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
