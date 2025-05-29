const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const generateTransactionPDF = require('../utils/pdfGenerator');
const sendReportMail = require('../utils/mailer');
const User = require('../models/User');

const dailyReportJob = () => {
  const schedule = process.env.REPORT_TIME;
  cron.schedule(schedule, async () => {
    console.log('Running daily report job');

    const users = await User.find();
    for (const user of users) {
      const transactions = await Transaction.find({ userId: user._id });

      let totalIncome = 0, totalExpense = 0;
      transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else if (t.type === 'expense') totalExpense += t.amount;
      });

      const summary = {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      };

      const pdfBuffer = await generateTransactionPDF(transactions, summary);
      if (user.email) {
        await sendReportMail(user.email, summary, pdfBuffer);
        console.log(`Mail sent to ${user.email}`);
      }
    }
  }, {
    timezone: "Asia/Kolkata"
  });
};

module.exports = dailyReportJob;
