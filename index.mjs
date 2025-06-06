// index.mjs
import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';


dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

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



app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


app.get('/', (req, res) => {
  res.render('landing.ejs');
});
app.get('/login', (req, res) => {
  res.render('logIn.ejs');
});

app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if(!username || !password){
      return res.status(400).send("all fields must be filled")
    }

    try{
      const[users] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      if(users.length === 0){
        return res.status(401).send("invalid username or password");
      }

      let user = users[0];

      let match = await bcrypt.compare(password, user.password);

      if(!match){
        return res.status(401).send("Invalid username or password")
      }

        req.session.user = {
        id: user.id,
        username: user.username,
        firstName: user.firstName, 
        secret: '!r2d2c3po!'
      };
      console.log('Session:', req.session);
      res.render("home.ejs", {user:req.session.user})
    } catch(err){
      console.error('Login error:', err);
      res.status(500).send('Server error.');
    }
});

app.get('/signUp', (req, res) => {
    res.render('signUp.ejs');
});

app.post('/signUp', async (req, res) => {

  
  let fn = req.body.firstName;
  let ln = req.body.lastName;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let hashPass = await bcrypt.hash(password, 10);
  if (!username || !email ||!fn || !ln) {
    return res.status(400).send('All fields are required');
  }

  try{
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);

    if (existing.length > 0) {
      return res.status(409).send('Username already taken.');
    }
    let sql = `INSERT INTO users 
    (firstName, lastName, email, username, password)
    VALUES (?,?,?,?, ?)`;
    let sqlParams = [fn,ln,email, username, hashPass];
    const [rows] = await conn.query(sql, sqlParams);
    res.render('created.ejs');

  } catch(err){
    console.error('Signup error:', err);
    res.status(500).send('Server error.');
  }
  
});

app.get('/profile', (req, res) => {
  res.render('profile.ejs');
});

app.get('/search', async (req, res) => {
  const query = req.body.query;

  if (!query) {
    return res.status(400).send('Please enter a search query.');
  }

  try {
    const [results] = await pool.query(
      `SELECT id, username FROM users WHERE username LIKE ?`,
      [`%${searchQuery}%`] 
    );

    res.render('search-results.ejs', {
      query: searchQuery,
      users: results
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).send('Search failed.');
  }

});

app.get('/search-users', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const [users] = await pool.query(
      'SELECT id, username FROM users WHERE username LIKE ? LIMIT 10',
      [`%${query}%`]
    );
    res.json(users);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json([]);
  }
});

app.get('/profile/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [results] = await pool.query(
      'SELECT id, username, firstName, profile_picture FROM users WHERE id = ?',
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    const userProfile = results[0];
    res.render('userProfile.ejs', { userProfile });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Server error');
  }
});

app.get('/dbTest', async (req, res) => {
  const [rows] = await pool.query('SELECT CURDATE()');
  res.send(rows);
});


app.listen(3000, () => {
    console.log('Express server running on http://localhost:3000');
  });

  