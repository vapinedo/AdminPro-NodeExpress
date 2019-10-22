var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

/*-----------------------------------
    Token Verification: POST
-----------------------------------*/ 

exports.checkTokenJWT = function (req, res, next) {
    
    var token = req.query.token;
    
    jwt.verify( token, SEED, ( err, decoded ) => {
    
        if ( err ) {
            return res.status(401).json({
                ok: false,
                message: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
        
    });
} 