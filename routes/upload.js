const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

// middleware: default options
app.use(fileUpload());

app.put('/:coleccion/:id', (req, res, next) => {

    const idRegistroColeccion = req.params.id; // id del usuario, medico, hospital, etc
    const coleccion = req.params.coleccion; // usuario, medico, hospital, etc

    // Validar tipos de colecciones
    const coleccionesArr = [ 'usuarios', 'medicos', 'hospitales' ];

    if ( coleccionesArr.indexOf( coleccion ) < 0 ) {

        return res.status(400).json({
            ok: false,
            message: 'Coleccion o tabla no válida',
            errors: { message: 'No existe la colección o tabla' }
        });
    }

    if( !req.files ) {

        return res.status(400).json({
            ok: false,
            message: 'No has seleccionado una imagen',
            errors: { message: 'Debes seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    const archivo = req.files.imagen;
    const nombreCortado = archivo.name.split('.');
    const extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    // Solo estas extensiones aceptamos
    const extensionesValidas = [ 'png', 'jpg', 'gif', 'jpeg' ];

    if ( extensionesValidas.indexOf( extensionArchivo ) < 0 ) {

        return res.status(400).json({
            ok: false,
            message: 'Exntesión no válida',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    // 12345678-6789.png
    const nombreArchivo = `${ idRegistroColeccion }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del path temporal al path destino
    const path = `./uploads/${ coleccion }/${ nombreArchivo }`;

    archivo.mv( path, err => {

        if ( err ) {

            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo a ruta destino',
                errors: err
            });            
        }

        asignarArchivoAColeccion( coleccion, idRegistroColeccion, nombreArchivo, res );
    });

});

function asignarArchivoAColeccion( coleccion, idRegistroColeccion, nombreArchivo, res ) {

    if ( coleccion === 'usuarios' ) {
         
        Usuario.findById( idRegistroColeccion, ( err, usuario ) => {

            if ( !usuario ) {

                return res.status(400).json({
                    ok: false,
                    message: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            // Si existe elimina la imagen anterior
            const pathViejo = './uploads/usuarios/' + usuario.img;
            if ( fs.existsSync( pathViejo ) ) {

                fs.unlink( pathViejo, ( err ) => {

                    if ( err ) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error reemplazando imagen antigua',
                            errors: err
                        });
                    }
                });
            }            

            usuario.img = nombreArchivo;

            usuario.save( ( err, usuarioActualizado ) => {

                usuarioActualizado.password = ':)';

                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error actualizando imagen',
                        errors: err
                    });
                }                

                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });                                
            })
            
        });
    }

    if ( coleccion === 'medicos' ) {

        Medico.findById( idRegistroColeccion, ( err, medico ) => {

            if ( !medico ) {

                return res.status(400).json({
                    ok: false,
                    message: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }            

            // Si existe elimina la imagen anterior
            const pathViejo = './uploads/medicos/' + medico.img;
            if ( fs.existsSync( pathViejo ) ) {

                fs.unlink( pathViejo, ( err ) => {

                    if ( err ) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error reemplazando imagen antigua',
                            errors: err
                        });
                    }
                });
            }            

            medico.img = nombreArchivo;

            medico.save( ( err, medicoActualizado ) => {

                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error actualizando imagen',
                        errors: err
                    });
                }                

                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });                                
            })
            
        });
    }

    if ( coleccion === 'hospitales' ) {

        Hospital.findById( idRegistroColeccion, ( err, hospital ) => {

            if ( !hospital ) {

                return res.status(400).json({
                    ok: false,
                    message: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }            

            // Si existe elimina la imagen anterior
            const pathViejo = './uploads/hospitales/' + hospital.img;
            if ( fs.existsSync( pathViejo ) ) {

                fs.unlink( pathViejo, ( err ) => {

                    if ( err ) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error reemplazando imagen antigua',
                            errors: err
                        });
                    }
                });
            }            

            hospital.img = nombreArchivo;

            hospital.save( ( err, hospitalActualizado ) => {

                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error actualizando imagen',
                        errors: err
                    });
                }                

                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });                                
            })
            
        });
    }

}

module.exports = app;