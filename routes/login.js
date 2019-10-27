const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

const app = express();
const Usuario = require('../models/usuario');

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/*-----------------------------------
    LOGIN Google: POST
-----------------------------------*/ 
async function verify( token ) {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {

    const token = req.body.token;
    const googleUser = await verify( token )
            .catch( err => {
                
                return res.status(403).json({
                    ok: false,
                    message: 'Token no válido'
                });
            });

    Usuario.findOne({ email: googleUser.email }, ( err, usuarioDB ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }
        
        if ( usuarioDB ) {

            if ( usuarioDB.google === false ) {

                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar su autenticación normal'
                });                
            } else {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });        
            }

        } else {

            // El usuario no existe ... hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save( ( err, usuarioDB ) => {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });     
            });
        }     
    });

})

/*-----------------------------------
    LOGIN Normal: POST
-----------------------------------*/ 
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, ( err, usuarioDB ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }
        
        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                // TODO: quitar esto en produccion
                message: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if ( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
            return res.status(400).json({
                ok: false,
                // TODO: quitar esto en produccion
                message: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token JWT
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });        
    });

});

module.exports = app;


