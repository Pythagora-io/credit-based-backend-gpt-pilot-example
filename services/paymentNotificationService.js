const { sendEmail } = require('./emailService');

const sendPaymentConfirmationEmail = async (user, creditAmount, amountPaid) => {
  const dynamicTemplateData = {
    username: user.username,
    creditAmount,
    amount: (amountPaid / 100).toFixed(2), // Convert cents to dollars
  };

  await sendEmail({
    to: user.email,
    subject: 'Payment Confirmation',
    templateId: process.env.SENDGRID_TEMPLATE_PAYMENT_CONFIRMATION, // INPUT_REQUIRED {Add the SendGrid template ID for payment confirmations in the .env file}
    dynamicTemplateData: dynamicTemplateData,
  });

  console.log(`Payment confirmation email sent to: ${user.email}`);
};

module.exports = { sendPaymentConfirmationEmail };
