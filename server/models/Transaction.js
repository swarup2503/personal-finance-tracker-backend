const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: String,
  amount: Number,
  date: { type: Date, default: () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })) },
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  time: {
    type: String,
    default: () => {
      const ist = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
      return ist;
    }
  }
});


module.exports = mongoose.model('Transaction', transactionSchema);
