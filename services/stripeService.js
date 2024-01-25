const stripe = require("../config/stripe");
const { sendPaymentConfirmationEmail } = require('./paymentNotificationService');

async function chargeUser(user, price) {
    const paymentMethod = await stripe.paymentMethods.retrieve(
        'pm_card_visa'
    );
    let paymentIntent;

    if (paymentMethod) {
        paymentIntent = await stripe.paymentIntents.create({
            amount: price,
            currency: 'usd',
            customer: user.stripeCustomerId,
            payment_method: paymentMethod.id,
            off_session: true,
            confirm: true,
            metadata: {
                userId: user._id.toString(),
                creditsPurchased: user.autoReplenishAmount
            }
        });

        if (paymentIntent.status === 'succeeded') {
            await sendPaymentConfirmationEmail(user, user.autoReplenishAmount, amount);
        }
    }

    return paymentIntent;
}
module.exports = {
    chargeUser
}
