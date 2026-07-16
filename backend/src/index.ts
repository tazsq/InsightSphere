import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('InsightSphere API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
