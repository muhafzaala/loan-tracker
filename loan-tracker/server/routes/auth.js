import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validateSignupInput } from '../middleware/validateInput.js';

const router = express.Router();

router.post('/signup', validateSignupInput, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      data: { token, user: { id: newUser._id, name: newUser.name, email: newUser.email } },
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Signup failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      data: { token, user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

export default router;
