// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Variables Init
var app = express();

// Body Parser Setup: create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Routes Import
 var appRoutes = require('./routes/app');
 var usuarioRoutes = require('./routes/usuario');
 var loginRoutes = require('./routes/login');

// Connect to Mongo Database
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true, useUnifiedTopology: true }, ( err, res ) => {
    if ( err ) throw err;
    
    console.log('Database: \x1b[32m%s\x1b[0m', 'online');
});

// Routes
app.use('/usuario', usuarioRoutes); 
app.use('/login', loginRoutes);
app.use('/', appRoutes); 

// Request listening
app.listen(3000, () => {
    console.log('Express server on 3000 port: \x1b[32m%s\x1b[0m', 'online');
});