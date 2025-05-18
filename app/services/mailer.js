const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

async function sendMail({ from, to, subject, text, html }) {
    const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
    });

    return info;
}

module.exports = { sendMail };