const Xray = require('x-ray');
const x = Xray();

const link = 'http://www.clarin.com/deportes/tenis/Copa-Davis-Pella-Argentina-quedo_0_1651634981.html';

x(link, {
    imagenUrl: '.img-box img@src'
})( function (err, result) {
    console.log(result);
});

