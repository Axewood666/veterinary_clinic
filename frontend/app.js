const express = require('express');
const path = require('path');
const app = express();

app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'src', 'public')));

const routes = require('./src/routes');
app.use('/', routes);

module.exports = app;