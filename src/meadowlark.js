const express = require('express');
const handlers = require('./lib/handlers');
const weatherMiddleware = require('./lib/middleware/weather');

const expressHandlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');

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

app.use(express.static(__dirname + '/public'));
app.use(weatherMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', handlers.home);

app.get('/about', handlers.about);

// Showing headers from a request
app.get('/headers', handlers.showHeader);
// Section test
app.get('/section-test', handlers.sectionTest);
// Newsletter
app.get('/newsletter-signup', handlers.newsletterSignup);
app.post('/newsletter-signup/process', handlers.newsletterSignupProcess);
app.get('/newsletter-signup/thank-you', handlers.newsletterSignupThankYou);
app.get('/newsletter', handlers.newsletter);
app.post('/api/newsletter-signup', handlers.api.newsletterSignup);
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


if (require.main == module) {
    app.listen(port, () => console.log(`Listening on port ${port}...`));
} else {
    module.exports = app;
}