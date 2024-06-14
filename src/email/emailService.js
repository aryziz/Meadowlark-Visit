const { credentials } = require('../config');
const htmlToFormattedText = require('html-to-formatted-text');


const nodemailer = require('nodemailer');
/* Mail */
const mailTransport = nodemailer.createTransport({
    host: credentials.brevo.host,
    port: credentials.brevo.port,
    auth: {
        user: credentials.brevo.user,
        pass: credentials.brevo.pass
    }
});

const sendMailSingleRec = async (to, subject, html) => {
    try {
        const result = await mailTransport.sendMail({
            from: '"Meadowlark Travel" <aryanam@uia.no>',
            to: to,
            subject: subject,
            html: html,
            text: htmlToFormattedText(html)
        });
        console.log(`Mail sent successfully: ${result}`);
        return result
    } catch (err) {
        console.log(`Could not send mail: ${err.message}`);
        return err;
    }
}

const sendMailMultipleRec = async () => {
    try {
        const result = await mailTransport.sendMail({
            from: '"Meadowlark Travel" <aryanam@uia.no>',
            to: 'arymat2605@gmail.com, "Test customer 1" <arymat2605@gmail.com>,'
                +
                'arymat123@hotmail.com',
            subject: 'Your Meadowlark Travel Tour',
            text: 'Thank you for booking your trip with Meadowlark Travel.'
                + 'We look forward to your visit!'
        });
        console.log(`Mail sent successfully: ${result}`);
    } catch (err) {
        console.log(`Could not send mail: ${err.message}`);
    }
}

module.exports = { sendMailSingleRec, sendMailMultipleRec };