const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const port = process.env.PORT || 3000;
const fileUpload = require('express-fileupload');

const app = express();

app.use(fileUpload());
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Set view engine and middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

// Define the path to the uploads folder
const uploadDir = path.join(__dirname, 'uploads');

// Function to check if 'uploads' directory exists and create it if not
function ensureUploadsDirExists() {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
        console.log(`'uploads' folder was not found, so it was created at: ${uploadDir}`);
    }
}

// Call this function when the server starts
ensureUploadsDirExists();


// Routes

// Register Page
app.get('/register', (req, res) => res.render('register'));


app.get('/', (req, res) => res.render('register'));


app.post('/register', async (req, res) => {
    const { username, password, faceData } = req.body;

    if (faceData) {
        console.log('Received face data:');
        // Handle face registration here (e.g., save faceData)
        res.redirect('/login');
    } else if (username && password) {
        console.log("Received registration data:", req.body); // Log received data
        try {
            const newUser = new User({ username, password });
            await newUser.save();
            console.log('User registered:', newUser);
            res.redirect('/login');
        } catch (error) {
            console.error('Error registering user:', error);
            res.redirect('/register');
        }
    } else {
        res.redirect('/register');
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Log incoming login data for debugging
    console.log("Login request received:", req.body);

    try {
        // Find user in the database
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send('User not found');
        }

        // Compare passwords (you should hash passwords in real implementation)
        if (user.password === password) {
            // Successful login, redirect to dashboard
            return res.redirect('/dashboard');
        } else {
            return res.status(400).send('Invalid password');
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send('Server error');
    }
});


// Login Page
app.get('/login', (req, res) => res.render('login'));

// Dashboard
app.get('/dashboard', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) throw err;
        res.render('dashboard', { files });
    });
});

// // Handle file upload
// app.post('/upload', upload.single('medicalFile'), (req, res) => {
//     res.redirect('/dashboard');
// });


// Upload Route
app.post('/upload', (req, res) => {
    // Check if any files are uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
        console.error('No files were uploaded.');
        return res.status(400).send('No file was uploaded.');
    }

    // Access the uploaded file
    const uploadedFile = req.files.uploadedFile;

    if (!uploadedFile) {
        console.error('uploadedFile is undefined.');
        return res.status(400).send('No uploaded file found.');
    }

    console.log('File name:', uploadedFile.name);  // Log the file name

    // Define the path where the file will be uploaded
    const uploadPath = path.join(uploadDir, uploadedFile.name);

    // Move the file to the upload directory
    uploadedFile.mv(uploadPath, (err) => {
        if (err) {
            console.error('File upload failed:', err);
            return res.status(500).send('File upload failed.');
        }

        res.redirect('/dashboard');
    });
});
// Handle file download
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.download(filePath);
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
