var Xray = require('x-ray'),
    x = Xray(),
    async = require('async'),
    feed = require("feed-read"),
    cheerio = require('cheerio'),
    MongoClient = require('mongodb').MongoClient;

var noticias = [];
var feedUrls = [
    ['http://contenidos.lanacion.com.ar/herramientas/rss/categoria_id=30', 'politica'],
    ['http://contenidos.lanacion.com.ar/herramientas/rss/categoria_id=272', 'economia'],
    ['http://contenidos.lanacion.com.ar/herramientas/rss/categoria_id=131', 'deportes'],
    ['http://contenidos.lanacion.com.ar/herramientas/rss/categoria_id=120', 'espectaculos'],
    ['http://contenidos.lanacion.com.ar/herramientas/rss/categoria_id=7773', 'sociedad'],
    //['http://contenidos.lanacion.com.ar/herramientas/rss/origen=2','ultimasnoticias'],


    ['http://www.clarin.com/rss/politica/', 'politica'],
    ['http://www.clarin.com/rss/ieco/', 'economia'],
    ['http://www.clarin.com/rss/deportes/', 'deportes'],
    ['http://www.clarin.com/rss/espectaculos/', 'espectaculos'],
    ['http://www.clarin.com/rss/sociedad/', 'sociedad'],
    //['http://www.clarin.com/rss/lo-ultimo/', 'ultimasnoticias'],
    ['http://www.clarin.com/rss/mundo/', 'internacionales'],

    // ['http://www.telam.com.ar/rss2/ultimasnoticias.xml', 'ultimasnoticias'],
    ['http://www.telam.com.ar/rss2/politica.xml', 'politica'],
    ['http://www.telam.com.ar/rss2/sociedad.xml', 'sociedad'],
    ['http://www.telam.com.ar/rss2/economia.xml', 'economia'],
    ['http://www.telam.com.ar/rss2/deportes.xml', 'deportes'],
    ['http://www.telam.com.ar/rss2/espectaculos.xml', 'espectaculos'],
    ['http://www.telam.com.ar/rss2/internacional.xml', 'internacionales'],

    ['http://www.ambito.com/rss/noticias.asp?s=Econom%C3%ADa', 'economia'],
    ['http://www.ambito.com/rss/noticias.asp?s=Pol%C3%ADtica', 'politica'],
    ['http://www.ambito.com/rss/noticias.asp?s=Deportes', 'deportes'],
    ['http://www.ambito.com/rss/noticias.asp?s=Espect%C3%A1culos', 'espectaculos'],
    ['http://www.ambito.com/rss/noticiasp.asp', 'ultimasnoticias'],
    ['http://www.ambito.com/rss/noticias.asp?s=Internacionales', 'internacionales']

    /* //['http://m.pagina12.com.ar/diario/economia/index.html','politica'],
     //['http://m.pagina12.com.ar/diario/economia/index.html','economia'],
     //'http://m.pagina12.com.ar/diario/deportes/index.html', 'deportes'],
     //['http://m.pagina12.com.ar/diario/suplementos/espectaculos/index.html', 'espectaculos'],
     //['http://m.pagina12.com.ar/diario/sociedad/index.html', 'sociedad']
    */

];

// Connection url
var dbUrl = 'mongodb://admin:newspark@ds033036.mlab.com:33036/newspark';
//var dbUrl = 'mongodb://mongo.newspark.local:27017/newspark';
//var dbUrl = 'mongodb://190.114.222.125:27000/newspark';
console.log('starting');


//If it is running for more than a minute and a half it will exit
//This is horrible... God forgive me.
setTimeout(function(){
    console.error('Run for more than a minute and a half mins');
    process.exit();
}, 90 * 1000);

MongoClient.connect(dbUrl, function (err, db) {
    if (err) throw err;

    var connection = db;

    console.log('connected')

    async.each(feedUrls, function (feedUrl, rssSourceCallback) {
        feed(feedUrl[0], function (err, articles) {
            if (err) {
                console.error(err)

                throw err;
            }
            async.each(articles, function (article, articleCallback) {
                article.tag = feedUrl[1];

                switch (article.author) {
                    case 'lanacion.com':
                        laNacionParser(article, articleCallback);
                        break;
                    case 'Clarin.com':
                        clarinParser(article, articleCallback);
                        break;
                    case 'Ambito.com':
                        ambitoParser(article, articleCallback);
                        break;
                    case '':
                        //articleCallback();
                        telamParser(article, articleCallback);
                        break;
                }

            }, rssSourceCallback);

        });

    }, function (err) {
        if (err) {
            console.error(err);
        }


        /*db.collection('news').createIndex( { "link": 1 } , { unique: true } );

        var bulk = db.collection('news').initializeUnorderedBulkOp();
        for (var i = 0; i < noticias.length; i++) {
            bulk.insert(noticias[i]);
        }
        bulk.execute(function (err, result) {
            if (err) {
              console.error(err);
              return;
            }
            db.close();
        });*/

        db.close();

        console.log('DONE!');

    });

    function getDbConnection(callback) {
        if (connection) {
            callback(null, connection);
        }
        else {
            MongoClient.connect(dbUrl, function(err, db) {
                if (err) {
                    console.error(err);
                    connection = null;
                    callback(err);
                }

                connection = db;

                callback(null, connection);
            });
        }
    }


    function insertArticle(article, callback) {
        getDbConnection(function(err, db) {
            if (err) {
                console.error(err);
                connection = null;
                callback(err);
            }

            db.collection('news').insert(article, function (err, r) {
                // Error 11000 es indice duplicado (nosotros tenemos indice por link)
                if (err && err.code != 11000) {
                    console.error(err);
                    connection = null;
                    callback(err);
                }
                else {
                    callback();
                }
            });
        })
    }

    function clarinParser(articulo, callback) {
        x(articulo.link, {
            titulo: '.int-nota-title h1',
            contenidoNota: ['.nota > p'],
            imageUrl: '.img-box img@src'
        })(function (err, obj) {
            if (err) {
                console.error(err)
                callback(err);
            }
            else {
                if (obj.contenidoNota.join(' ').split(' ').length > 50) {
                    var a = {};
                    a.content = obj.contenidoNota.join('\n');
                    a.link = articulo.link;
                    a.title = articulo.title;
                    a.tag = articulo.tag;
                    a.imageUrl = obj.imageUrl || '';
                    a.source = 'clarin';
                    console.log(a);

                    insertArticle(a, callback);
                } else {
                    callback();
                }
            }
        });

    }

    function telamParser(articulo, callback) {
        // HACK: A veces articulo.link es un link relativo, lo arreglamos a mano
        if (articulo.link && articulo.link[0] === '/') {
            articulo.link = 'http://www.telam.com.ar' + articulo.link;
        }
        x(articulo.link, {
            titulo: '.title h1',
            contenidoNota: '.editable-content',
            imageUrl: '.image-left img@src'
        })(function (err, obj) {
            if (err) {
                console.error(err);
                callback(err);
            }
            else {
                var a = {};
                var $ = cheerio.load(obj.contenidoNota);
                $('script').remove();
                $('ul').remove();
                $('blockquote.twitter-tweet').remove();
                a.content = $.text().replace('\r\n\t\t\t\t\t\t                            ', '').replace('                        \t\t\t\t\t\t\r\n\t\t\t\t', '').replace('\r\n\t\t\t\t\t', '').replace('                        \t\t\t\t\t\t', '').replace('\t', '');
                if (a.content.split(' ').length > 50) {
                    a.link = articulo.link;
                    a.title = articulo.title;
                    a.tag = articulo.tag;
                    a.imageUrl = obj.imageUrl || '';
                    a.source = 'telam';
                    console.log(a);

                    insertArticle(a, callback);
                } else {
                    callback();
                }
            }
        });
    }

    function ambitoParser(articulo, callback) {
        x(articulo.link, {
            titulo: 'header.titulo-noticia h2',
            contenidoNota: ['.despliegue-noticia > p'],
            imageUrl: 'picture > img@data-src'
        })(function (err, obj) {
            if (err) { return callback(err); }
            var a = {};
            a.content = obj.contenidoNota.join('\n ').trim();
            if (err || a.content.indexOf('setTimeout(') !== -1) {
                console.error(err)
                callback(err);
            }
            else {
                a.link = articulo.link;
                a.title = articulo.title;
                a.tag = articulo.tag;
                a.imageUrl = obj.imageUrl.replace(/_[a-z][A-Z]+/, '') || '';
                a.source = 'ambito';

                console.log(a);

                insertArticle(a, callback);
            }
        });

    }


    function laNacionParser(articulo, callback) {
        x(articulo.link, {
            titulo: '.int-nota-title h1',
            contenidoNota: ['#cuerpo > p'],
            imageUrl: '.f-imagenRelacionada img@src'
        })(function (err, obj) {

            if (err) {
                console.error(err)
                callback(err);
            }
            else {
                if (obj.contenidoNota.join(' ').split(' ').length > 50) {
                    var a = {};
                    a.content = obj.contenidoNota.join(' \n ');
                    a.link = articulo.link;
                    a.title = articulo.title;
                    a.tag = articulo.tag;
                    a.imageUrl = obj.imageUrl || '';
                    a.source = 'lanacion';
                    console.log(a);

                    insertArticle(a, callback);
                } else {
                    callback();
                }

            }
        });

    }

});
