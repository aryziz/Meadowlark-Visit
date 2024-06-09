const fortune = require('./fortune');

exports.home = (req, res) => res.render('home', { today: new Date().toUTCString() });

exports.about = (req, res) => res.render('about', { fortune: fortune.getFortune() });

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
