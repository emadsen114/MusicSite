// index.mjs
import express from 'express';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));


// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   connectionLimit: 10,
//   waitForConnections: true
// });

     




app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.get('/login', (req, res) => {
    res.render('logIn.ejs');
});

app.get('/signUp', (req, res) => {
    res.render('signUp.ejs');
});


app.listen(3000, () => {
    console.log('Express server running on http://localhost:3000');
  });

  