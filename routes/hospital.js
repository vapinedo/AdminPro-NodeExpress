const express = require('express');
const app = express();

const middlewareAuth = require('../middlewares/auth');

const Hospital = require('../models/hospital');

/*-----------------------------------
    READ Hospitales: GET
-----------------------------------*/ 
app.get('/', (req, res, next) => {

    var paginateFrom = req.query.paginateFrom || 0;
    paginateFrom = Number( paginateFrom );    

    Hospital.find({})
        .skip( paginateFrom )
        .limit( 5 )    
        .populate( 'usuario', 'nombre email' )
        .exec(    
            ( err, hospitales ) => {
                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al cargar hospitales de la DB',
                        errors: err
                    });
                }

                Hospital.count({}, ( err, counting ) => {
                    
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: counting
                    });
                });                
            }
        )

});

/*-----------------------------------
    CREATE hospital: POST
-----------------------------------*/ 
app.post('/', middlewareAuth.checkTokenJWT, (req, res) => {

    var body = req.body;
    
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( ( err, hospitalGuardado ) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });    
    });

});

/*-----------------------------------
    UPDATE hospital: PUT
-----------------------------------*/ 
app.put('/:id', middlewareAuth.checkTokenJWT, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, ( err, hospital ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar hospital',
                errors: err
            });
        }      
        
        if ( !hospital ) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( ( err, hospitalGuardado ) => {

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar hospital',
                    errors: err
                });
            }         
            
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });                
        });
    });

});

/*-----------------------------------
    DELETE hospital: DELETE
-----------------------------------*/ 
app.delete('/:id', middlewareAuth.checkTokenJWT, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove( id, ( err, hospitalBorrado ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar hospital',
                errors: err
            });
        }

        if ( !hospitalBorrado ) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese ID',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });    
    });
});

module.exports = app;