const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer'); // For file uploads
const path = require('path');
const fs = require('fs');
 require('dotenv').config();

const app = express();

const dontenv = require('dotenv').config
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Sessions
app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
  })
);

// Multer config for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Define User schema and model in app.js
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  faceIdData: String,  // For Face-ID (face descriptor)
  biometricData: String, // For Biometric (fingerprint)
});
const User = mongoose.model('User', userSchema);

// Routes

// Home Page
app.get('/', (req, res) => {
  res.render('index');
});

// Register Page
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle Registration
app.post('/register', async (req, res) => {
  const { name, email, password, faceId, biometric } = req.body;

  if (password) {
    // Hash password if registering with email/password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } else if (faceId) {
    // Store Face-ID data
    const user = new User({ name, faceIdData: faceId });
    await user.save();
    res.redirect('/login');
  } else if (biometric) {
    // Store Biometric data (fingerprint)
    const user = new User({ name, biometricData: biometric });
    await user.save();
    res.redirect('/login');
  } else {
    res.send('Invalid registration method');
  }
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle Login
app.post('/login', async (req, res) => {
  const { email, password, faceId, biometric } = req.body;

  if (password) {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      res.redirect('/dashboard');
    } else {
      res.send('Invalid login');
    }
  } else if (faceId) {
    // Handle Face-ID login
    const user = await User.findOne({ faceIdData: faceId });
    if (user) {
      req.session.userId = user._id;
      res.redirect('/dashboard');
    } else {
      res.send('Invalid Face-ID login');
    }
  } else if (biometric) {
    // Handle Biometric login
    const user = await User.findOne({ biometricData: biometric });
    if (user) {
      req.session.userId = user._id;
      res.redirect('/dashboard');
    } else {
      res.send('Invalid Biometric login');
    }
  }
});

// Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('dashboard');
});

// File upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.send(`File uploaded: ${req.file.originalname}`);
});

// JavaScript for Face-ID (front-end)
app.get('/js/faceid.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/js/faceid.js'));
});

// JavaScript for Biometric (front-end)
app.get('/js/biometric.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/js/biometric.js'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
