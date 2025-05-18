const { sendMail } = require('./mailer');
const db = require('../config/database');


async function getTemplateAndFill(name, variables) {
    const template = await db('email_templates').where('name', name).first();
    if (!template) throw new Error('Шаблон не найден');

    let html = template.body;
    for (const key in variables) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    }
    return { subject: template.subject, html };
}

async function sendInvitationEmail(email, token) {
    const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;
    try {
        const { subject, html } = await getTemplateAndFill('invite', {
            inviteLink
        });

        await sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject,
            html
        });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    sendInvitationEmail
};