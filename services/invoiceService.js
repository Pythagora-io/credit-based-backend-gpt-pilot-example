const Invoice = require('../models/Invoice');
const fs = require('fs');
const path = require('path');

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

const generateReceipt = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const receiptText = `Receipt ID: ${invoice._id}\nUser ID: ${invoice.userId}\nCredits Purchased: ${invoice.creditsPurchased}\nAmount Paid: ${invoice.amountPaid}\nDate: ${invoice.createdAt}`;
  const receiptPath = path.join(__dirname, `../receipts/receipt-${invoice._id}.txt`);

  ensureDirectoryExistence(receiptPath); // Make sure the directory exists
  fs.writeFileSync(receiptPath, receiptText);

  return receiptPath;
};

const getInvoicesForUser = async (userId) => {
  if (!userId) {
    throw new Error('UserID is required to fetch invoices');
  }
  try {
    // Ensure we always return an array, even when no invoices are found
    return await Invoice.find({ userId: userId }).sort({ createdAt: -1 }).lean() || [];
  } catch (error) {
    throw new Error('Failed to retrieve invoices: ' + error.message);
  }
};

module.exports = {
  generateReceipt,
  getInvoicesForUser
};
