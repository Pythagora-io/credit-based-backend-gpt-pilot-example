const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  creditsPurchased: { 
    type: Number, 
    required: true 
  },
  amountPaid: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  refunded: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
