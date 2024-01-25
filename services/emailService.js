const sgMail = require('../config/sendgrid');

const sendEmail = async ({ to, subject, templateId, dynamicTemplateData }) => {
  const msg = {
    to,
    from: process.env.EMAIL_USER,
    subject: subject || 'No Subject', // Provide a default subject line
    templateId: templateId,
    dynamic_template_data: dynamicTemplateData
  };

  // If templateId is not provided, you should include a content block.
  if (!templateId) {
    msg.content = [{
      type: 'text/plain',
      value: 'This is an automated message. Please do not reply.'
    }];
  }

  try {
    let yo = await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid response:', error.response.body);
    }
  }
};

module.exports = { sendEmail };
