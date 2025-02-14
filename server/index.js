
import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from './User.js';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",  // Allow localhost (for local dev)
    "https://ecommercedashboard-1.onrender.com"  // Allow your frontend URL in production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Passport
app.use(passport.initialize());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5001/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    user = new User({
      googleId: profile.id,
      username: profile.displayName,
      email
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.post('/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/auth/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = Date.now() + 600000; // OTP expires in 10 min
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/auth/check', (req, res) => {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ authenticated: false });
      res.json({ authenticated: true });
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

app.post('/auth/login', async (req, res) => {
    const { email, password, otp } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });
  
      // Check password first
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ message: 'Invalid password' });
  
      // Enforce OTP check if required
      if (user.otp && user.otpExpiry > Date.now()) {
        if (!otp) return res.status(400).json({ message: 'OTP required' });
  
        const validOTP = await bcrypt.compare(otp, user.otp);
        if (!validOTP) return res.status(400).json({ message: 'Invalid OTP' });
  
        // Clear OTP only after successful validation
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
      }
  
      // Proceed to generate token only after all validations
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });
      res.json({ message: 'Login successful' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

app.get('/api/user', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('username email profileImage');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.username,
      email: user.email,
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('https://ecommercedashboard-rshy.onrender.com/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

app.get('https://ecommercedashboard-rshy.onrender.com/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login',
    session: false
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.redirect('http://localhost:5173/home');
  }
);

app.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not registered' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Reset Password',
      text: `Reset your password here: http://localhost:5173/reset-password/${token}`
    });

    res.json({ message: "Email sent" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/auth/reset-password/:token', async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
