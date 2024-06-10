const express = require('express');
const handlers = require('./lib/handlers');
const weatherMiddleware = require('./lib/middleware/weather');

const expressHandlebars = require('express-handlebars');
const bodyParser = require('body-parser');

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
app.get('/section-test', handlers.sectionTest);
app.get('/newsletter-signup', handlers.newsletterSignup);
app.post('/newsletter-signup/process', handlers.newsletterSignupProcess);
app.get('/newsletter-signup/thank-you', handlers.newsletterSignupThankYou);
app.get('/newsletter', handlers.newsletter);
app.post('/api/newsletter-signup', handlers.api.newsletterSignup);


if (require.main == module) {
    app.listen(port, () => console.log(`Listening on port ${port}...`));
} else {
    module.exports = app;
}