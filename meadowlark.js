const express = require('express');

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

app.get('/about', (req, res) => res.render('about'));

app.get('/about', (req, res) => {
    res.type('text/plain');
    res.send('About Meadowlark Travel');
})

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