const express = require('express');
const handlers = require('./lib/handlers');

const expressHandlebars = require('express-handlebars');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;

// Configure handlebars view engine
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');

app.get('/', handlers.home);

app.get('/about', handlers.about);

app.use(express.static(__dirname + '/public'));

if (require.main == module) {
    app.listen(port, () => console.log(`Listening on port ${port}...`));
} else {
    module.exports = app;
}

