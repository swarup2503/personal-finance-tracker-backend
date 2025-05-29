const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');
const getStream = require('get-stream');
const moment = require('moment');
const path = require('path');
const momenttime = require('moment-timezone');

const generateTransactionPDF = async (transactions, summary) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Create a PassThrough stream
  const stream = new PassThrough();
  doc.pipe(stream);

  // Load fonts
  const fontPath = path.join(__dirname, '../assets/fonts/DejaVuSans.ttf');
  const boldFontPath = path.join(__dirname, '../assets/fonts/DejaVuSans-Bold.ttf');
  doc.registerFont('DejaVu', fontPath);
  doc.registerFont('DejaVu-Bold', boldFontPath);

  // Start writing to PDF
  doc.font('DejaVu').fontSize(20).text('Transaction Summary', { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(14);
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  doc.text(`Balance: ${formatter.format(summary.balance)}`);
  doc.text(`Total Income: ${formatter.format(summary.totalIncome)}`);
  doc.text(`Total Expenses: ${formatter.format(summary.totalExpense)}`);
  doc.moveDown(2);

  const startX = doc.page.margins.left;
  let y = doc.y;

  doc.font('DejaVu-Bold').fontSize(12);
  doc.text('Date', startX, y, { width: 70 });
  doc.text('Time', startX + 80, y, { width: 60 });
  doc.text('Type', startX + 150, y, { width: 60 });
  doc.text('Category', startX + 220, y, { width: 90 });
  doc.text('Amount (₹)', startX + 320, y, { width: 80 });
  doc.text('Description', startX + 410, y, { width: 150 });

  doc.moveDown(0.5);
  doc.font('DejaVu');
  y = doc.y;
  doc.moveTo(startX, y).lineTo(startX + 560, y).stroke();
  y += 5;

  for (const t of transactions) {
    if (y > doc.page.height - doc.page.margins.bottom - 50) {
      doc.addPage();
      y = doc.page.margins.top;
    }

    const formattedDate = moment(t.date).format('DD-MM-YYYY');
    const formattedTime = momenttime.utc(t.date).tz('Asia/Kolkata').format('HH:mm');

    doc.text(formattedDate, startX, y, { width: 70, lineBreak: false });
    doc.text(formattedTime, startX + 80, y, { width: 60, lineBreak: false });
    doc.text(t.type, startX + 150, y, { width: 60, lineBreak: false });
    doc.text(t.category || '-', startX + 220, y, { width: 90, lineBreak: false });
    doc.text(`₹${t.amount.toFixed(2)}`, startX + 320, y, { width: 80, lineBreak: false });
    doc.text(t.description || '-', startX + 410, y, { width: 150, lineBreak: false });

    y += 20;
  }

  doc.end();

  // Use getStream to get the buffer from the PassThrough stream
  const pdfBuffer = await getStream.buffer(stream);
  return pdfBuffer;
};

module.exports = generateTransactionPDF;
