// Requires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Variables Init
const app = express();

// Body Parser Setup: create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Routes Import
 var appRoutes = require('./routes/app');
 var usuarioRoutes = require('./routes/usuario');
 var loginRoutes = require('./routes/login');
 var hospitalRoutes = require('./routes/hospital');
 var medicoRoutes = require('./routes/medico');
 var busquedaRoutes = require('./routes/busqueda');
 var uploadRoutes = require('./routes/upload');
 var imagenesRoutes = require('./routes/imagenes');

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    },

    ( err, res ) => {

        if ( err ) throw err;
        console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
    }
);

// Routes
app.use('/usuario', usuarioRoutes); 
app.use('/hospital', hospitalRoutes); 
app.use('/medico', medicoRoutes); 
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes); 

// Request listening
app.listen(3000, () => {
    console.log('Express server on 3000 port: \x1b[32m%s\x1b[0m', 'online');
});