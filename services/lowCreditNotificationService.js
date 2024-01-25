const User = require('../models/User');
const { sendEmail } = require('./emailService');
const CONSTANTS = require('../config/constants');

const notifyLowCredit = async (userId) => {
    const user = await User.findById(userId);
    if (!user || user.credits >= CONSTANTS.LOW_CREDIT_THRESHOLD || user.lowCreditAlertSent) {
        return;
    }

    const dynamicTemplateData = {
        username: user.username,
        credits: user.credits,
    };

    await sendEmail({
        to: user.email,
        subject: 'Low Credit Alert',
        templateId: process.env.SENDGRID_TEMPLATE_LOW_CREDIT, // INPUT_REQUIRED {Add the SendGrid template ID for low credit alerts in the .env file}
        dynamicTemplateData: dynamicTemplateData,
    });

    console.log(`Low credit notification sent to ${user.email}`);

    user.lowCreditAlertSent = true;
    await user.save();
};

module.exports = { notifyLowCredit };