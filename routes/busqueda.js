const express = require('express');
const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

/*-----------------------------------
    SEARCH One Collection: GET
-----------------------------------*/ 
app.get('/coleccion/:nombrecoleccion/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var nombrecoleccion = req.params.nombrecoleccion;
    var regularExpression = new RegExp( busqueda, 'i' );

    var promesa;

    switch ( nombrecoleccion ) {
        case 'usuarios':
            promesa = buscarUsuarios( busqueda, regularExpression );
            break;

        case 'medicos':
            promesa = buscarMedicos( busqueda, regularExpression );
            break;

        case 'hospitales':
            promesa = buscarHospitales( busqueda, regularExpression );
            break;

        default: 
            return res.status(400).json({
                ok: false,
                mensaje: 'La coleccion o tabla no existe',
                error: { message: 'Coleccion o tabla existe' }
            });
    }

    promesa.then( data => {

        res.status(200).json({
            ok: true,
            [nombrecoleccion]: data
        });
    });    
    
});

/*-----------------------------------
    SEARCH All Collections: GET
-----------------------------------*/ 
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regularExpression = new RegExp( busqueda, 'i' );

    Promise.all([ 
            buscarHospitales( busqueda, regularExpression ), 
            buscarMedicos( busqueda, regularExpression ),
            buscarUsuarios( busqueda, regularExpression )
        ])
        .then( respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales ( busqueda, regularExpression ) {

    return new Promise(( resolve, reject ) => {
        
        Hospital.find({ nombre: regularExpression })
            .populate( 'usuario', 'nombre email' )
            .exec(( err, hospitales ) => {
                    
                if ( err ) {
                    reject('Error cargando hospitales:', err);
                } else {

                    resolve( hospitales );
                }
            });
    });
}

function buscarMedicos ( busqueda, regularExpression ) {

    return new Promise(( resolve, reject ) => {
        
        Medico.find({ nombre: regularExpression })
            .populate( 'usuario', 'nombre email' )
            .populate( 'hospital' )
            .exec(( err, medicos ) => {
            
                if ( err ) {
                    reject('Error cargando medicos:', err);
                } else {

                    resolve( medicos );
                }
            });
    });
}

function buscarUsuarios ( busqueda, regularExpression ) {

    return new Promise(( resolve, reject ) => {
        
        Usuario.find({}, 'nombre email role')
            .or([
                { nombre: regularExpression },
                { email: regularExpression },
            ])
            .exec( ( err, usuarios ) => {
                
                if ( err ) {
                    reject('Error cargando usuarios:', err);
                } else {

                    resolve( usuarios );
                }
            });
    });
}

module.exports = app;