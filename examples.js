  
var feed = require("feed-read");

var url = 'http://contenidos.lanacion.com.ar/herramientas/rss-origen=2';
  
  feed(url, function(err, articles) {
    if (err) throw err;
    
           
        console.log(articles);
        // Each article has the following properties:
        // 
        //   * "title"     - The article title (String).
        //   * "author"    - The author's name (String).
        //   * "link"      - The original article link (String).
        //   * "content"   - The HTML content of the article (String).
        //   * "published" - The date that the article was published (Date).
        //   * "feed"      - {name, source, link}
        // 
    });