import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// ✅ Railway MySQL connection
const db = mysql.createConnection({
  host: "mysql.railway.internal",
  user: "root",
  password: "WmQeTknhWyKPplIeOPdXTzkpuIjRZQhF", // from your screenshot
  database: "railway",
  port: 3306,
});

// ✅ Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to Railway MySQL Database!");
  }
});

// ✅ Create table if it doesn’t exist
db.query(
  `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price FLOAT NOT NULL
  )`,
  (err) => {
    if (err) console.error("❌ Table creation error:", err);
    else console.log("✅ Table ready");
  }
);

// ✅ Homepage - show all products
app.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.render("index", { products: results });
  });
});

// ✅ Add product
app.post("/add", (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.redirect("/");
  db.query("INSERT INTO products (name, price) VALUES (?, ?)", [name, price], (err) => {
    if (err) console.error("Insert error:", err);
    res.redirect("/");
  });
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
