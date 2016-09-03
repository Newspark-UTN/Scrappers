var Xray = require('x-ray'),
    x = Xray(),
    async = require('async'),
    feed = require("feed-read"),
    MongoClient = require('mongodb').MongoClient;


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

var noticias = [];

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
    if (err) throw err;

    // Connection url
    var dbUrl = 'mongodb://mongo.newspark.local:27017/newspark';

    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
          console.error(err);
          return;
        }
        db.collection('news').insertMany(noticias, function (err, r) {
            if (err) {
              console.error(err);
              return;
            }
            db.close();
        });
    });
});

function clarinParser(articulo, callback) {
    x(articulo.link, {
        titulo: '.int-nota-title h1',
        contenidoNota: ['.nota p']
    })(function (err, obj) {
        if (!err) {
            var a = {};
            a.content = obj.contenidoNota.join('\n');
            a.link = articulo.link;
            a.title = articulo.title;
            a.tag = articulo.tag;
            a.source = 'clarin';
            console.log(a);

            noticias.push(a);
        }
        callback();
    });

}

function laNacionParser(articulo, callback) {
    x(articulo.link, {
        titulo: '.int-nota-title h1',
        contenidoNota: '#cuerpo'
    })(function (err, obj) {
        if (!err) {
            var a = {};
            a.content = obj.contenidoNota;
            a.link = articulo.link;
            a.title = articulo.title;
            a.tag = articulo.tag;
            a.source = 'lanacion';
            console.log(a);

            noticias.push(a);
        }
        callback();
    });

}
