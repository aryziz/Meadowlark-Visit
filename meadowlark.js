const express = require('express');
const fortune = require('./lib/fortune');

const expressHandlebars = require('express-handlebars');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;

// Configure handlebars view engine
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');

app.get('/', (req, res) => res.render('home'));

app.get('/about', (req, res) => {
    res.render('about', { fortune: fortune.getFortune() });
});

app.use(express.static(__dirname + '/public'));

// 404 Page
app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

// 500 page
app.use((err, req, res, next) => {
    console.error(err.message);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Internal Server Error');
})

app.listen(port, () => console.log(`Listening on port ${port}...`));

