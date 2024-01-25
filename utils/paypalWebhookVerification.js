const paypal = require('../config/paypal');

const verifyPaypalWebhook = (req) => {
  const transmissionId = req.headers['paypal-transmission-id'];
  const timestamp = req.headers['paypal-transmission-time'];
  const webhookEventBody = JSON.stringify(req.body);

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (paypal.notification.webhookEvent.verify(transmissionId, timestamp, webhookId, webhookEventBody)) {
    return true;
  } else {
    return false;
  }
};

module.exports = { verifyPaypalWebhook };
