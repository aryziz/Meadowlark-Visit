const pathUtils = require('path');
const fs = require('fs');
const db = require('../db/db');

const fortune = require('./fortune');
const { sendMailSingleRec } = require('./email/emailService');

/* eslint-disable no-useless-escape */
const VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
    '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
    '(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$');
/* eslint-enable no-useless-escape */

class NewsletterSignup {
    constructor({ name, email }) {
        this.name = name;
        this.email = email;
    }

    async save() {
    }
}

exports.home = (req, res) => {
    req.session.flash = {
        type: 'warning',
        intro: 'New Feature!',
        message: 'Check out new flash messages',
        SameSite: 'None'
    }
    res.render('home', {
        today: new Date().toISOString().split('T')[0]
    });
}

exports.about = (req, res) => res.render('about', { fortune: fortune.getFortune() });

exports.newsletterSignup = (req, res) => res.render('newsletter-signup', { csrf: 'CSRF token goes here' });

exports.newsletterSignupProcess = (req, res) => {
    const name = req.body.name || '', email = req.body.email || ''
    // input validation
    if (!VALID_EMAIL_REGEX.test(email)) {
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid.',
        }
        return res.redirect(303, '/newsletter-signup')
    }
    // NewsletterSignup is an example of an object you might create; since
    // every implementation will vary, it is up to you to write these
    // project-specific interfaces.  This simply shows how a typical
    // Express implementation might look in your project.
    new NewsletterSignup({ name, email }).save()
        .then(() => {
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'You have now been signed up for the newsletter.',
                SameSite: 'None'
            }
            return res.redirect(303, '/newsletter-archive')
        })
        .catch(err => {
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later. Error code:' + err,
                SameSite: 'None'
            }
            return res.redirect(303, '/newsletter-archive')
        })
}

exports.newsletterArchive = (req, res) => res.render('newsletter-archive')

exports.newsletterSignupThankYou = (req, res) => res.render('newsletter-signup-thank-you');

exports.newsletter = (req, res) => {
    res.render('newsletter', { csrf: 'CSRF token goes here' });
}

exports.api = {
    newsletterSignup: (req, res) => {
        console.log(`CSRF token (from hidden form): ${req.body._csrf}`);
        console.log(`Name (from visible form field): ${req.body.name}`);
        console.log(`Email (from visible form field): ${req.body.email}`);
        res.send({ result: 'success' });
    }
}

exports.vacationPhotoContest = (req, res) => {
    const now = new Date();
    res.render('contest/vacation-photo', { year: now.getFullYear(), month: now.getMonth() });
}

/* eslint-disable no-unused-vars */
exports.vacationPhotoContestProcessError = (req, res, fields, files) => {
    res.redirect(303, '/contest/vacation-photo-error')
}
/* eslint-enable no-unused-vars */

exports.vacationPhotoContestProcessThankYou = (req, res) => {
    res.render('contest/vacation-photo-thank-you')
}

const dataDir = pathUtils.resolve(__dirname, '..', 'data');
const vacationPhotosDir = pathUtils.join(dataDir, 'vacation-photos');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(vacationPhotosDir)) fs.mkdirSync(vacationPhotosDir);

function saveContestEntry(contestName, email, year, month, photoPath) {
}

const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);

exports.vacationPhotoContestProcess = async (req, res, fields, files) => {
    const photo = files.photo[0];
    const dir = vacationPhotosDir + '/' + Date.now();
    const path = dir + '/' + photo.originalFilename;
    await mkdir(dir);
    await rename(photo.path, path);
    saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
    res.redirect(303, '/contest/vacation-photo-thank-you');
}

exports.listVacations = async (req, res) => {
    const vacations = await db.getVacations({ available: true });
    const context = {
        vacations: vacations.map(vacation => {
            return {
                sku: vacation.sku,
                name: vacation.name,
                description: vacation.description,
                price: '$' + vacation.price,
                inSeason: vacation.inSeason,
            }
        })
    }
    res.render('vacations', context);
}

exports.notifyWhenInSeasonForm = (req, res) => res.render('notify-me-when-in-season', { sku: req.query.sku });

exports.notifyWhenInSeasonProcess = async (req, res) => {
    const { email, sku } = req.body;
    await db.addVacationInSeasonListener(email, sku);
    return res.redirect(303, '/vacations');
}

exports.processCheckout = (req, res, next) => {
    const cart = req.session.cart;
    if (!cart) return next(new Error('Cart does not exist.'));

    const user_name = req.body.name || '';
    const user_email = req.body.email || '';

    if (!user_email.match(VALID_EMAIL_REGEX))
        return next(new Error('Invalid email address'));

    cart.number = Math.random().toString().replace(/^0\.0*/, '');
    cart.billing = {
        name: user_name,
        email: user_email
    };

    // Render the email template
    res.render('email/cart-thank-you', { layout: null, cart: cart }, (err, html) => {
        if (err) {
            console.log('Error in email template', err);
            return next(err);
        }

        console.log(`Rendered email: ${html}`);

        sendMailSingleRec(cart.billing.email, 'Thank You!', html)
            .then(info => {
                console.log('Sent!' + info);
                // Pass the billing information to the thank-you page
                res.render('cart/cart-thank-you', { cart });
            })
            .catch(err => {
                console.error('Unable to send confirmation, ' + err.message);
                next(err);
            });
    });
};

exports.checkoutThankYou = (req, res) => res.render('cart/cart-thank-you');

exports.notFound = (req, res) => res.render('404');


/* eslint-disable no-unused-vars */
exports.serverError = (err, req, res, next) => res.render('500');
/* eslint-enable no-unused-vars */
