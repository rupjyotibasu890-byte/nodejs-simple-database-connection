const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Create MySQL connection using Railway environment variables
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'test',
  port: process.env.MYSQLPORT || 3306
});

// ✅ Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

// Example route — Get all products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching products');
    }
    res.json(results);
  });
});

// Example route — Add a product
app.post('/products', (req, res) => {
  const { name, price } = req.body;
  const sql = 'INSERT INTO products (name, price) VALUES (?, ?)';
  db.query(sql, [name, price], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error adding product');
    }
    res.send('Product added successfully');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
