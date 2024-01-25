const crypto = require('crypto');
const { sendEmail } = require('./emailService');

const generatePasswordResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.LOCAL_URL}/reset-password/${token}`;
  const templateId = process.env.SG_TEMPLATE_ID_PASS_RESET
  const dynamicTemplateData = {
    resetLink: resetUrl
    // more dynamic data can be added as needed
  };

  await sendEmail({
    to: email,
    templateId: templateId,
    dynamicTemplateData: dynamicTemplateData
  });
};

module.exports = {
  generatePasswordResetToken,
  sendPasswordResetEmail
};
