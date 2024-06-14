const handlers = require('./lib/handlers');
const weatherMiddleware = require('./lib/middleware/weather');
const flashMiddleware = require('./lib/middleware/flash');
const { credentials } = require('./config');
const { sendMailSingleRec, sendMailMultipleRec } = require('./email/emailService');

// External
const express = require('express');
const expressHandlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const morgan = require('morgan');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;

// Configure handlebars view engine
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
    helpers: {
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
    },
}));
app.set('view engine', 'handlebars');

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(credentials.cookieSecret));
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));

app.use(weatherMiddleware);
app.use(flashMiddleware);

app.get('/', handlers.home);

app.get('/about', handlers.about);

// Newsletter
// handlers for browser-based form submission
app.get('/newsletter-signup', handlers.newsletterSignup)
app.post('/newsletter-signup/process', handlers.newsletterSignupProcess)
app.get('/newsletter-signup/thank-you', handlers.newsletterSignupThankYou)
app.get('/newsletter-archive', handlers.newsletterSignupThankYou)

// Vacation photo
app.get('/contest/vacation-photo', handlers.vacationPhotoContest);
app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).send({ error: err.message });
        handlers.vacationPhotoContestProcess(req, res, fields, files);
    });
});
app.get('/contest/vacation-photo-thank-you', handlers.vacationPhotoContestProcessThankYou);

// Cart
app.get('*', (req, res) => {
    req.session.cart = [
        { id: '82RgrqGCAHqCf6rA2vujbT', qty: 1, guests: 2 },
        { id: 'bqBtwqxpB4ohuxCBXRE9tq', qty: 1 },
    ];
    res.render('cart/cart-home');
});
app.get('/cart', handlers.checkoutThankYou);
app.post('/cart/checkout', handlers.processCheckout);

if (require.main == module) {
    app.listen(port, () => console.log(`Listening on port ${port}...`));
} else {
    module.exports = app;
}