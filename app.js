var Xray = require('x-ray');
var x = Xray();
var async = require('async');
var feed = require("feed-read");


var url = "http://www.clarin.com/rss/lo-ultimo/";

var feedUrls = [
   'http://contenidos.lanacion.com.ar/herramientas/rss-origen=2',
   'http://www.clarin.com/rss/lo-ultimo/'
  
]

var noticias = [];

async.each(feedUrls, function(feedUrl, rssSourceCallback){
    feed(feedUrl, function(err, articles) {
        console.log(articles);
        if (err) throw err;
        
        
        async.each(articles, function(article, articleCallback){
            switch(article.author){
                case 'lanacion.com':
                    laNacionParser(article, articleCallback);
                    break;
                case 'Clarin.com':
                    clarinParser(article, articleCallback);
                    break;
            }
        }, rssSourceCallback);
     
    });
    
}, function(err){
    if (err) throw err;
    console.log(noticias);
});


var link= "http://www.clarin.com/juegos-olimpicos-rio-2016/Potro-va-final-olimpica-Nadal_0_1631236947.html";

function clarinParser(articulo, callback){
    x(articulo.link,{
        titulo: '.int-nota-title h1',
        contenidoNota: '.nota'
    })(function(err, obj){
        if(!err){
            articulo.contenidoNota = obj.contenidoNota;
            noticias.push(articulo);
        }         
        callback()
    });
    
}

function laNacionParser(articulo, callback){
    console.log(articulo);
    x(articulo.link,{
        titulo: '.int-nota-title h1',
        contenidoNota: '#cuerpo'
    })(function(err, obj){
        if(!err){
            articulo.contenidoNota = obj.contenidoNota;
            noticias.push(articulo);
        }         
        callback()
    });
    
}