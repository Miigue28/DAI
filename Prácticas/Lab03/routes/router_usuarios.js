import express from 'express'
import jwt from 'jsonwebtoken'

import User from '../model/User.js'

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
	try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).send('User not found');
    }

    // Validate password
    const is_match = await user.is_valid_password(password);
    if (!is_match) {
      return res.status(401).send('Invalid password');
    }

    // Sign JWT token
    const token = jwt.sign({name: user.name, email: user.email, admin: user.admin}, process.env.SECRET_KEY)
 
    // Set cookie with token
    res.cookie("access_token", token, {
    	httpOnly: true,
      // In production, set secure flag
    	secure: process.env.IN === 'production'
    }).redirect("/")
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
})

// Register
router.post('/register', async (req, res) => {
	const { name, surname, email, password } = req.body;

	try {
    const user = new User({ name, surname, email, password });
    await user.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send(`Registration failed: ${err}`);
  }
})

// Logout
router.get('/logout', (req, res) => {
  // Manage cookie destruction
  res.clearCookie('access_token');
	res.redirect('/')
})

export default router;