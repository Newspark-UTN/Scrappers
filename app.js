var Xray = require('x-ray'),
    x = Xray(),
    async = require('async'),
    feed = require("feed-read"),
    MongoClient = require('mongodb').MongoClient;

var noticias = [];
var feedUrls = [
    ['http://contenidos.lanacion.com.ar/herramientas/rss/categoria_id=30', 'politica'],
    ['http://contenidos.lanacion.com.ar/herramientas/rss/categoria_id=272', 'economia'],
    ['http://contenidos.lanacion.com.ar/herramientas/rss/categoria_id=131', 'deportes'],
    ['http://contenidos.lanacion.com.ar/herramientas/rss/categoria_id=120', 'espectaculos'],

    ['http://www.clarin.com/rss/politica/', 'politica'],
    ['http://www.clarin.com/rss/ieco/', 'economia'],
    ['http://www.clarin.com/rss/deportes/', 'deportes'],
    ['http://www.clarin.com/rss/espectaculos/', 'espectaculos'],
];

// Connection url
var dbUrl = 'mongodb://mongo.newspark.local:27017/newspark';

MongoClient.connect(dbUrl, function (err, db) {
    if (err) throw err;

    async.each(feedUrls, function (feedUrl, rssSourceCallback) {
        feed(feedUrl[0], function (err, articles) {
            if (err) throw err;
            async.each(articles, function (article, articleCallback) {
                article.tag = feedUrl[1];

                switch (article.author) {
                    case 'lanacion.com':
                        laNacionParser(article, articleCallback);
                        break;
                    case 'Clarin.com':
                        clarinParser(article, articleCallback);
                        break;
                }

            }, rssSourceCallback);

        });

    }, function (err) {
        if (err) {
            console.error(err);
        }

        db.close();

        console.log('DONE!'); 
    });


    function insertArticle(article, callback) {
        db.collection('news').insert(article, function (err, r) {
            // Error 11000 es indice duplicado (nosotros tenemos indice por link)
            if (err && err.code != 11000) {
                console.error(err);
                callback(err);
            }
            else {
                callback();
            }
        });
    }

    function clarinParser(articulo, callback) {
        x(articulo.link, {
            titulo: '.int-nota-title h1',
            contenidoNota: ['.nota p']
        })(function (err, obj) {
            if (err) {
                callback(err);
            }
            else {
                var a = {};
                a.content = obj.contenidoNota.join('\n');
                a.link = articulo.link;
                a.title = articulo.title;
                a.tag = articulo.tag;
                a.source = 'clarin';
                console.log(a);

                insertArticle(a, callback);
            }
        });

    }

    function laNacionParser(articulo, callback) {
        x(articulo.link, {
            titulo: '.int-nota-title h1',
            contenidoNota: '#cuerpo'
        })(function (err, obj) {
            if (err) {
                callback(err);
            }
            else {
                var a = {};
                a.content = obj.contenidoNota;
                a.link = articulo.link;
                a.title = articulo.title;
                a.tag = articulo.tag;
                a.source = 'lanacion';
                console.log(a);

                insertArticle(a, callback);
            }
        });

    }
});
