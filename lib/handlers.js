const fortune = require('./fortune');

exports.home = (req, res) => res.render('home', { today: new Date().toUTCString() });

exports.about = (req, res) => res.render('about', { fortune: fortune.getFortune() });

exports.newsletterSignup = (req, res) => res.render('newsletter-signup', { csrf: 'CSRF token goes here' });

exports.newsletterSignupProcess = (req, res) => {
    console.log(`Form querystring: ${req.query.form}`);
    console.log(`CSRF token (from hidden form field): ${req.body._csrf}`);
    console.log(`Name (from visible form): ${req.body.name}`);
    console.log(`Email (from visible form field): ${req.body.email}`);
    res.redirect(303, '/newsletter-signup/thank-you');
}

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

exports.sectionTest = (req, res) => res.render('section-test');

exports.notFound = (req, res) => res.render('404');

exports.showHeader = (req, res) => {
    res.type('text/plain');
    const headers = Object.entries(req.headers).map(([key, value]) => `${key} : ${value}`);
    res.send(headers.join('\n'));
};

/* eslint-disable no-unused-vars */
exports.serverError = (err, req, res, next) => res.render('500');
/* eslint-enable no-unused-vars */
