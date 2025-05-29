const nodemailer = require('nodemailer');

const sendReportMail = async (email, summary, pdfBuffer) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
  from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "📊 Your Daily Transaction Summary",
  html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #007BFF;">Your Daily Transaction Summary</h2>
      <p>Hello,</p>
      <p>Here is a quick overview of your financial activity for today:</p>

      <table cellpadding="10" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%; max-width: 500px; text-align: left;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th>Metric</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Balance</strong></td>
            <td>₹${summary.balance.toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Total Income</strong></td>
            <td>₹${summary.totalIncome.toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Total Expenses</strong></td>
            <td>₹${summary.totalExpense.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <p>You can find the detailed transaction report in the attached PDF file.</p>

      <p style="margin-top: 20px;">Thank you for using <strong>Finance Tracker</strong>!<br/>
      <em>- The Finance Tracker Team</em></p>
    </div>
  `,
  attachments: [
    {
      filename: 'transactions.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf'
    }
  ]
});

};

module.exports = sendReportMail;
