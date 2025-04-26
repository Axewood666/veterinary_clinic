const express = require('express');
const app = express();

const apiRoutes = require('./src/api/routes');
app.use('/api', apiRoutes);

// const frontRoutes = require('./front/routes');
// app.use('/', frontRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;