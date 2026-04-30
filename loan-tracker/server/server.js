import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import loanRoutes from './routes/loans.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('DB connection failed:', err));

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => res.json({ message: 'Loan Tracker API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
