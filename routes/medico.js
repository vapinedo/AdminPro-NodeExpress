const express = require('express');

const middlewareAuth = require('../middlewares/auth');

const app = express();
const Medico = require('../models/medico');

/*-----------------------------------
    READ Medicos: GET
-----------------------------------*/ 
app.get('/', (req, res, next) => {

    var paginateFrom = req.query.paginateFrom || 0;
    paginateFrom = Number( paginateFrom );    

    Medico.find({})
        .skip( paginateFrom )
        .limit( 5 )        
        .populate( 'usuario', 'nombre email' )
        .populate( 'hospital' )
        .exec(    
            ( err, medicos ) => {
                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al cargar medicos de la DB',
                        errors: err
                    });
                }

                Medico.count({}, ( err, counting ) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: counting
                    });
                });
            }
        )

});

/*-----------------------------------
    CREATE medico: POST
-----------------------------------*/ 
app.post('/', middlewareAuth.checkTokenJWT, (req, res) => {

    var body = req.body;
    
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( ( err, medicoGuardado ) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });    
    });

});

/*-----------------------------------
    UPDATE medico: PUT
-----------------------------------*/ 
app.put('/:id', middlewareAuth.checkTokenJWT, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, ( err, medico ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar medico',
                errors: err
            });
        }      
        
        if ( !medico ) {
            return res.status(400).json({
                ok: false,
                message: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( ( err, medicoGuardado ) => {

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar medico',
                    errors: err
                });
            }         
            
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });                
        });
    });

});

/*-----------------------------------
    DELETE medico: DELETE
-----------------------------------*/ 
app.delete('/:id', middlewareAuth.checkTokenJWT, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove( id, ( err, medicoBorrado ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar medico',
                errors: err
            });
        }

        if ( !medicoBorrado ) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un medico con ese ID',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });    
    });
});

module.exports = app;