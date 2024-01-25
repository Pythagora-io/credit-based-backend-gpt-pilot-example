const { sendEmail } = require('./emailService');

const sendAutoReplenishEmail = async (user, creditAmount, totalCost) => {
  const dynamicTemplateData = {
    username: user.username,
    creditAmount,
    totalCost: (totalCost / 100).toFixed(2),
  };

  await sendEmail({
    to: user.email,
    subject: 'Auto-Replenish Confirmation',
    templateId: process.env.SENDGRID_TEMPLATE_AUTO_REPLENISH,
    dynamicTemplateData: dynamicTemplateData,
  });

  console.log(`Auto-replenish email sent to ${user.email}`);
};

module.exports = { sendAutoReplenishEmail };
