const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const { verifyToken } = require('./middleware/authMiddleware');
const connectDB = require('./config/db');


const app = express();
dotenv.config();

app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow frontend domain
  credentials: true, 
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', verifyToken, transactionRoutes);

const PORT = process.env.PORT || 5000;


// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});


const dailyReportJob = require('./jobs/dailyreport');
dailyReportJob();