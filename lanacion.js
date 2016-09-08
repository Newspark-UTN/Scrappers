var Xray = require('x-ray');
var x = Xray();

 x('http://www.lanacion.com.ar/1927884-rio-2016-juan-martin-del-potro-nadal',{
        titulo: '.int-nota-title h1',
        contenido: '#cuerpo'
    })(function(err, obj){
        if(!err){
            console.log(obj);
        }         
    });
    