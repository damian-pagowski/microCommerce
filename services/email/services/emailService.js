const nodemailer = require('nodemailer');

const { renderTemplate } = require('./templateService');
const { getLogger } = require('../shared/utils/logger');
const logger = getLogger();


// Create a transporter
const createTransporter = () => {
    const devCfg  = {
        host: '127.0.0.1',
        port: 1025,
        secure: false
    };

    const prodCfg = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    };
    if (process.env.NODE_ENV === 'production') {
        return nodemailer.createTransport(prodCfg);
    } else {
        return nodemailer.createTransport(devCfg);

    }
};
const transporter = createTransporter();

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
         const info = await transporter.sendMail(mailOptions);

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