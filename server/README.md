
# Finance Tracker Backend

A comprehensive RESTful API for personal finance management built with Node.js, Express, and MongoDB. This backend supports user authentication, transaction management, automated daily reports, and data export functionality.

## Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Transaction Management**: Create, read, update, and delete financial transactions
- **Real-time Balance Tracking**: Automatic calculation of income, expenses, and balance
- **Advanced Filtering**: Filter transactions by category, type, and date range
- **Data Export**: Export transaction history as CSV or PDF files
- **Automated Daily Reports**: Scheduled email reports with transaction summaries
- **Timezone Support**: IST (Asia/Kolkata) timezone handling
- **Email Notifications**: Automated email reports with PDF attachments

##  Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email Service**: Nodemailer
- **PDF Generation**: PDFKit
- **CSV Export**: json2csv
- **Task Scheduling**: node-cron
- **Date Handling**: moment.js



## Project Structure

```
finance-tracker-backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── jobs/
│   └── dailyreport.js        # Automated daily report job
├── middleware/
│   └── authMiddleware.js     # JWT authentication middleware
├── models/
│   ├── Transaction.js        # Transaction schema
│   └── User.js              # User schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── transactions.js      # Transaction management routes
├── utils/
│   ├── mailer.js            # Email utility functions
│   └── pdfGenerator.js      # PDF generation utility
├── assets/
│   └── fonts/               # Fonts for PDF generation
├── .env                     # Environment variables
├── server.js               # Main server file
└── README.md               # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Gmail account (for email reports)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGO_URI=your-database-uri
   

   # JWT Secret (use a strong random string)
   JWT_SECRET=your-super-secret-jwt-key

   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Cron Job Schedule (24-hour format)
   REPORT_TIME=0 8 * * *  # Daily at 8 AM IST

   # Server Port
   PORT=5000
   ```

4. **Set up Gmail App Password**
   - Enable 2-factor authentication on your Gmail account
   - Generate an app password: [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Use this app password in the `EMAIL_PASS` environment variable

5. **Font Setup for PDF Generation**
   ```bash
   mkdir -p assets/fonts
   # Download DejaVu fonts and place them in assets/fonts/
   # Required files: DejaVuSans.ttf, DejaVuSans-Bold.ttf
   ```

6. **Start the server**
   ```bash
   node server.js
   ```



## 🔗 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here"
}
```

### Transactions (Requires Authentication)

All transaction endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

#### Get All Transactions
```http
GET /api/transactions?category=food&type=expense&startDate=2023-01-01&endDate=2023-12-31
```

**Query Parameters:**
- `category` (optional): Filter by category (case-insensitive)
- `type` (optional): Filter by type (income/expense)
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

#### Create Transaction
```http
POST /api/transactions
Content-Type: application/json

{
  "type": "expense",
  "category": "Food",
  "amount": 250.50,
  "date": "2023-12-01",
  "description": "Lunch at restaurant"
}
```

#### Delete Transaction
```http
DELETE /api/transactions/:id
```

#### Get Balance Summary
```http
GET /api/transactions/summary
```

**Response:**
```json
{
  "income": 50000,
  "expenses": 25000,
  "balance": 25000
}
```

#### Export as CSV
```http
GET /api/transactions/export/csv
```

#### Export as PDF
```http
GET /api/transactions/export/pdf
```

## Data Models

### User Schema
```javascript
{
  email: String (required, unique),
  password: String (required, hashed)
}
```

### Transaction Schema
```javascript
{
  type: String (enum: ['income', 'expense'], required),
  category: String,
  amount: Number,
  date: Date (default: current IST date),
  description: String,
  userId: ObjectId (reference to User),
  time: String (IST time in HH:MM:SS format)
}
```

## Automated Daily Reports

The application automatically sends daily email reports to all users containing:
- Transaction summary (balance, total income, total expenses)
- Detailed PDF report with all transactions
- Scheduled via cron job (configurable via `REPORT_TIME` environment variable)

### Cron Schedule Format
```
# ┌───────────── minute (0 - 59)
# │ ┌───────────── hour (0 - 23)
# │ │ ┌───────────── day of month (1 - 31)
# │ │ │ ┌───────────── month (1 - 12)
# │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday - Saturday)
# │ │ │ │ │
# * * * * *

# Examples:
# 0 18 * * *    # Daily at 6 PM
# 0 9 * * 1     # Every Monday at 9 AM
# 30 8 1 * *    # 1st day of month at 8:30 AM
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-tracker
JWT_SECRET=your-production-jwt-secret
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
REPORT_TIME=0 8 * * *
PORT=5000
```


## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Mongoose schema validation
- **Authorization Middleware**: Protected routes
- **Environment Variables**: Sensitive data protection


## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify MONGO_URI in .env file
   - For Atlas: Check network access and credentials

2. **Email Reports Not Sending**
   - Verify Gmail app password is correct
   - Check if 2FA is enabled on Gmail account
   - Ensure EMAIL_USER and EMAIL_PASS are set correctly

3. **PDF Generation Fails**
   - Ensure DejaVu fonts are in assets/fonts/ directory
   - Check file permissions for font files

4. **JWT Token Invalid**
   - Verify JWT_SECRET is set in .env
   - Check token expiration (default: 1 day)


**Built with ❤️ for better financial management**
