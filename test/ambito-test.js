const Xray = require('x-ray');
const x = Xray();

const link = 'http://www.ambito.com/855321-llega-mision-del-fmi-para-auditar-las-cuentas-nacionales';

x(link, {
    titulo: 'int-nota-title h1',
    contenidoNota: ['.nota > p'],
    imagenUrl: 'picture > img@data-src'
})( function (err, result) {
	// Strip suffixes off image URL to get full size
	result.imagenUrl = result.imagenUrl.replace(/_[a-z][A-Z]+/, '');
    console.log(result);
});

