const assert = require('chai').assert;
const Xray = require('x-ray');
const ms = require('ms');
const telamScraper = Xray({
	filters: {
		fullResolution: (url) => url ? url.replace(/_[0-9]+x[0-9]+/, '') : '',
		getThumbnail: (url) => {
			if (typeof url === 'string') {
				const videoId = require('url').parse(url).pathname.split('/')[2];
				console.log(videoId);
				return `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
			} else {
				return '';
			}
		}
	}
}).timeout(ms('5s'));


const testCases = [
	{
		url: 'http://deportes.telam.com.ar/notas/201609/163307-newells-sarmiento-de-junin-diego-osella-primera-division-futbol.html',
		imageUrl: '' // image removed
	}, {
		url: 'http://deportes.telam.com.ar/notas/201609/163254-san-lorenzo-velez-futbol-primera-division.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57dd9ca822d09.jpg'
	}, {
		url: 'http://deportes.telam.com.ar/notas/201609/163308-banfield-adosivi-futbol-primera-division-falcioni-quiroz.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57ddbeab0ab10.jpg'
	}, {
		url: 'http://deportes.telam.com.ar/notas/201609/163310-lanus-union-de-santa-fe-jorge-amiron-leonardo-almiron.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57dda8eda5e61.jpg'
	}, {
		url: 'http://deportes.telam.com.ar/notas/201609/163278-edgardo-bauza-dt-seleccion-argentina-vuelven-gonzalo-higuain-sergio-aguero-eliminatorias.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57dc38f893eeb.jpg'
	}, {
		url: 'http://www.telam.com.ar/notas/201609/163395-presupuesto-kicillof.html',
		imageUrl: '' // No image in article
	}, {
		url: 'http://www.telam.com.ar/notas/201609/163373-pinedo-destaco-que-la-tarifa-social-cubrira-al-30-de-los-consumidores-mas-necesitados.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57dd678905c00.jpg'
	}, {
		url: 'http://deportes.telam.com.ar/notas/201609/163313-lionel-messi-leganes-futbol-espana-barcelona-luis-enrique.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57d9243a5e2c4.jpg'
	}, {
		url: 'http://deportes.telam.com.ar/notas/201609/163312-independiente-quilmes-futbol-primera-division-copa-sudamericana-gabriel-milito-maximiliano-meza.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57ddc323be50e.jpg'
	}, {
		url: 'http://www.telam.com.ar/notas/201609/163282-gilda-natalia-oreiro-cine-salas-pantallas.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57dc3b11b2657.jpg'
	}, {
		url: 'http://www.telam.com.ar/notas/201609/163204-pampa-yakuza-repasa-las-canciones-elegidas-por-sus-seguidores-en-vorterix.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57dbd134b8a4b.jpg'
	}, {
		url: 'http://www.telam.com.ar/notas/201609/163195-obra-yo-no-duermo-directora-teatral-paula-marull.html',
		imageUrl: 'https://i.ytimg.com/vi/yEKo-Gsy0jg/sddefault.jpg' // YouTube thumbnail
	}, {
		url: 'http://deportes.telam.com.ar/notas/201609/163304-los-pumas-frente-a-australia-argentina-wallabies-rugby-championship-daniel-hourcade.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2015/10/562d0a6560b4e.jpg'
	}, {
		url: 'http://deportes.telam.com.ar/notas/201609/163311-rosario-central-frente-a-patronato-futbol-primera-division.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/05/573e71e83da31.jpg'
	}, {
		url: 'http://deportes.telam.com.ar/notas/201609/163334-guido-pella-tenis-argentina-copa-davis-reino-unido--kyle-edmund.html',
		imageUrl: 'http://www.telam.com.ar/advf/imagenes/2016/09/57dc66a80d3c4.jpg'
	}
];

describe('Telam scraper', () => {
	testCases.forEach(test => {
		describe(test.url, () => {
			it('returns the correct image', (done) => {
				telamScraper(test.url, {
					imagenUrl: '.editable-content img@src | fullResolution',
					ytThumbnail: '.video iframe@src | getThumbnail'
				})(function(err, result) {
					if (err) { done(err); }
					assert.equal(result.imagenUrl || result.ytThumbnail || '', test.imageUrl);
					done();
				});
			});
		});
	});
});
