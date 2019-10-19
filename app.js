// Requires
var express = require('express');
var mongoose = require('mongoose');

// Variables Init
var app = express();

// Connect to Mongo Database
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true, useUnifiedTopology: true }, ( err, res ) => {
    if ( err ) throw err;
    
    console.log('Database: \x1b[32m%s\x1b[0m', 'online');
});

// Routes
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'Request success'
    });
});

// Request listening
app.listen(3000, () => {
    console.log('Express server on 3000 port: \x1b[32m%s\x1b[0m', 'online');
});