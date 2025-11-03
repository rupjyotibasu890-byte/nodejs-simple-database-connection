import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

let db;

// Open or create SQLite database
(async () => {
  db = await open({
    filename: path.join(__dirname, "products.db"),
    driver: sqlite3.Database,
  });

  // Create table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);

  // Insert sample data if table is empty
  const row = await db.get("SELECT COUNT(*) as count FROM products");
  if (row.count === 0) {
    await db.exec(`
      INSERT INTO products (name, price) VALUES
      ('Laptop', 55000),
      ('Mobile', 20000),
      ('Headphones', 2500),
      ('Smartwatch', 4500),
      ('Camera', 32000);
    `);
    console.log("🟢 Sample data inserted!");
  }
})();

// Homepage: display all products
app.get("/", async (req, res) => {
  const products = await db.all("SELECT * FROM products");
  res.render("index", { products });
});

// Add new product
app.post("/add", async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.redirect("/");
  await db.run("INSERT INTO products (name, price) VALUES (?, ?)", [name, price]);
  res.redirect("/");
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

