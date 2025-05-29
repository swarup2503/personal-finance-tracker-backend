const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();
const { Parser } = require('json2csv');


//get all transactions based on filters applied
router.get('/', async (req, res) => {
  const { category, type, startDate, endDate } = req.query;

  const filter = { userId: req.userId };

  if (category && category !== 'all') {
    filter.category = { $regex: new RegExp(category, 'i') }; // Case-insensitive match
  }

  if (type && type !== 'all') {
    filter.type = { $regex: new RegExp(type, 'i') }; // Case-insensitive match
  }

  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  try {
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});


//post a new transaction
router.post('/', async (req, res) => {
  try {
    let { type, category, amount, date, description } = req.body;
    type = type.toLowerCase();

    if (date && date.length === 10) {
      const now = new Date();
      const timePart = now.toISOString().split('T')[1]; // "HH:mm:ss.sssZ"
      date = `${date}T${timePart}`; // Combine date with current time
    }

    const transaction = new Transaction({
      type,
      category,
      amount,
      date,
      description,
      userId: req.userId,
    });
    const saved = await transaction.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create transaction' });
  }
});


// Delete a transaction by ID
router.delete('/:id', async (req, res) => {
  const transactionId = req.params.id;

  try {
    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      userId: req.userId, // Ensure user owns the transaction
    });

    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    res.json({ message: 'Transaction deleted successfully', deletedTransaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});



//get real time balance, income and expenses
router.get('/summary', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });

    let income = 0;
    let expenses = 0;

    transactions.forEach(tx => {
      if (tx.type.toLowerCase() === 'income') income += tx.amount;
      else if (tx.type.toLowerCase() === 'expense') expenses += tx.amount;
    });

    const balance = income - expenses;

    res.json({ income, expenses, balance });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

//export the transaction history as a csv file
router.get('/export/csv', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).lean();

    const fields = ['type', 'category', 'amount', 'date', 'description','time'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Could not generate CSV file' });
  }
});




//export the transaction history as a PDF file
const generateTransactionPDF = require('../utils/pdfGenerator');

router.get('/export/pdf', async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    // Calculate summary
    let totalIncome = 0, totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else if (t.type === 'expense') totalExpense += t.amount;
    });
    const balance = totalIncome - totalExpense;
    const summary = { totalIncome, totalExpense, balance };

        // Generate PDF buffer
    const pdfBuffer = await generateTransactionPDF(transactions, summary);

    // Set headers before streaming
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
    

    // Pass the response stream to your utility so it pipes PDF directly to client
    res.send(pdfBuffer);
    

  } catch (err) {
    // console.error(err);
    // res.status(500).json({ error: 'Failed to generate PDF' });
    
  console.error('Error generating PDF:', err);
  res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }

  
});


module.exports = router;
