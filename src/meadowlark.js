const handlers = require('./lib/handlers');
const weatherMiddleware = require('./lib/middleware/weather');
const flashMiddleware = require('./lib/middleware/flash');
const { credentials } = require('./config');
const { sendMailSingleRec, sendMailMultipleRec } = require('./lib/email/emailService');
const error = require('./lib/error/error-handling');

const fs = require('fs');
const cluster = require('cluster');
require('./db/db');


// External
const express = require('express');
const expressHandlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const Redis = require('redis');
const preRedisStore = require('connect-redis').default;
const morgan = require('morgan');
require('dotenv').config();

const app = express();

const redisClient = Redis.createClient({
    url: credentials.redis.url
});
redisClient.connect().catch(console.error);

const RedisStore = new preRedisStore({
    client: redisClient
});

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(credentials.cookieSecret));
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
    store: RedisStore
}));

app.use(weatherMiddleware);
app.use(flashMiddleware);
app.use((req, res, next) => {
    if (cluster.isWorker)
        console.log(`Worker ${cluster.worker.id} received request`);
    next();
});

switch (app.get('env')) {
    case 'development':
        app.use(morgan('dev'));
        break;
    case 'production':
        const stream = fs.createWriteStream(__dirname + '/log/access.log', { flags: 'a' });
        app.use(morgan('combined', { stream }));
        break;
}

app.get('/', handlers.home);
app.get('/about', handlers.about);

// Error
app.get('/fail', error.failError);
app.get('/epic-fail', error.epicFail);


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

// Vacation
app.get('/vacations', handlers.listVacations);
app.get('/set-currency/:currency', handlers.setCurrency);
app.get('/notify-me-when-in-season', handlers.notifyWhenInSeasonForm);
app.post('/notify-me-when-in-season', handlers.notifyWhenInSeasonProcess)
app.get('/cart', handlers.checkoutThankYou);
app.post('/cart/checkout', handlers.processCheckout);

// Server
const startServer = (port) =>
    app.listen(port, () => {
        console.log(`Express started in ${app.get('env')} mode. ` +
            `Listening on port ${port}...`);
    });

if (require.main === module) {
    startServer(process.env.PORT || 3000);
} else {
    module.exports = app;
}