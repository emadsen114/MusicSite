// index.mjs
import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';


dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true
});

export default pool;

const conn = await pool.getConnection();





app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.get('/login', (req, res) => {
    res.render('logIn.ejs');
});

app.get('/signUp', (req, res) => {
    res.render('signUp.ejs');
});

app.post('/signUp', async (req, res) => {
  let fn = req.body.firstName;
  let ln = req.body.lastName;
  let email = req.body.email;
  let username = req.body.username;
  let sql = `INSERT INTO account 
  (firstName, lastName, email, username)
  VALUES (?,?,?,?)`;
  let sqlParams = [fn,ln,email, username];
  const [rows] = await conn.query(sql, sqlParams);
  res.render('created.ejs');

});

app.get('/dbTest', async (req, res) => {
  const [rows] = await pool.query('SELECT CURDATE()');
  res.send(rows);
});


app.listen(3000, () => {
    console.log('Express server running on http://localhost:3000');
  });

  