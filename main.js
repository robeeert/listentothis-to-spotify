var https = require('https');

var options = {
  hostname: 'www.reddit.com',
  path: '/r/listentothis/top.json?sort=top&t=week'
};

https.get(options, function(res) {
  var json = '';

  res.on('data', function(chunk) {
    json += chunk;
  });

  res.on('end', function() {
    var list = JSON.parse(json);

    console.log(list.data.children[0]);

    var searchQuery = list.data.children[0].data.title;

    console.log(searchQuery);

    var spotifyOptions = {
      hostname: 'api.spotify.com',
      path: '/v1/search?query=' + searchQuery + '&offset=0&limit=20&type=track'
    };

    https.get(spotifyOptions, function(res) {
      var json = '';

      res.on('data', function(chunk) {
        json += chunk;
      });

      res.on('end', function() {
        var list = JSON.parse(json);

        console.log(list);


      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });


  });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
