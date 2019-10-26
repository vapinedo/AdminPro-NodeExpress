const express = require('express');
const app = express();

const path = require('path');
const fs = require('fs');

app.get('/:coleccion/:img', (req, res, next) => {

    const img = req.params.img;
    const coleccion = req.params.coleccion;

    const pathImage = path.resolve( __dirname, `../uploads/${ coleccion }/${ img }` );

    if ( fs.existsSync( pathImage ) ) {

        res.sendFile( pathImage );
    } else {

        const pathNoImage = path.resolve( __dirname, '../assets/no-image.jpg' );
        res.sendFile( pathNoImage );
    }
});

module.exports = app;