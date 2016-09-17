const Xray = require('x-ray');
const x = Xray();

const link = 'http://www.lanacion.com.ar/1938714-sin-contratiempos-el-gobierno-defendio-su-plan-para-subir-el-gas';

// Some articles such as this one:
// 	http://www.lanacion.com.ar/1938517-asi-encaminaba-la-victoria-delpo-tras-ganar-el-cuarto-set
// only have images loaded by JS, so they won't be picked up by the scrapper.

x(link, {
    imagenUrl: '.f-imagenRelacionada img@src'
})( function (err, result) {
	// Remove width suffix to get full resolution
    console.log(result);
});
