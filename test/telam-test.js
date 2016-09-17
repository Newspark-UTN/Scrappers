const Xray = require('x-ray');
const x = Xray();

const link = 'http://deportes.telam.com.ar/notas/201609/163334-guido-pella-tenis-argentina-copa-davis-reino-unido--kyle-edmund.html';

x(link, {
    imagenUrl: '.image-left img@src'
})( function (err, result) {
	// Remove resolution suffix from filename to get full size
	result.imagenUrl = result.imagenUrl.replace(/_[0-9]+x[0-9]+/, '');
    console.log(result);
});

