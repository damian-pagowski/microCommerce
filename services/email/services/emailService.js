const nodemailer = require('nodemailer');

const { renderTemplate } = require('./templateService');
const { getLogger } = require('../shared/utils/logger');
const logger = getLogger();


// Create a transporter
const createTransporter = () => {
    if (process.env.NODE_ENV === 'production') {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    } else {
        const nodemailermock = require('nodemailer-mock');
        const transport = nodemailermock.createTransport();
        return transport;
    }
};
// TODO: Uncomment the following line to create a transporter
// const transporter = createTransporter();

const sendOrderConfirmationEmail = async (to, orderDetails) => {
    try {
        logger.info({ to, orderId: orderDetails.orderId }, 'Preparing email content');

        const emailBody = await renderTemplate('orderConfirmation', orderDetails);

        const mailOptions = {
            from: '"MicroCommerce" <no-reply@microcommerce.com>',
            to,
            subject: `Order Confirmation - Order #${orderDetails.orderId}`,
            text: emailBody,
        };
        // TODO: Uncomment the following line to send the email
        const info = { messageId:mailOptions }
        //  const info = await transporter.sendMail(mailOptions);

        logger.info({ to, orderId: orderDetails.orderId, messageId: info.messageId }, 'Email sent successfully');
        return info;
    } catch (error) {
        logger.error({ to, orderId: orderDetails.orderId, error: error.message }, 'Failed to send email');
        throw error;
    }
};

module.exports = {
    sendOrderConfirmationEmail,
};