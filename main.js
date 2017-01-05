const https = require('https');

function cleanRedditTitle(title) {
  return title.replace(/\[.*\]|\(.*\)/g, '');
}

function getRedditWeeklyPosts(callback) {

  const options = {
    hostname: 'www.reddit.com',
    path: '/r/listentothis/top.json?sort=top&t=week&limit=25'
  };

  https.get(options, function(res) {
    let json = '';

    res.on('data', function(chunk) {
      json += chunk;
    });

    res.on('end', function() {
      const list = JSON.parse(json);

      let songs = [];

      let length = 0;

      list.data.children.forEach(function(post, index){

        if (!post.is_self) {
          searchSpotifyTrack(encodeURIComponent(cleanRedditTitle(post.data.title) ,function(searchResult){
            length++;

            if (searchResult.tracks.total && searchResult.tracks.total < 15) {
              songs[index] = searchResult.tracks.items[0].id;
            }

            if (list.data.children.length === length) {
              callback(songs);
            }
          })
        }
      });
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function searchSpotifyTrack(query, callback) {
  let spotifyOptions = {
    hostname: 'api.spotify.com',
    path: '/v1/search?query=' + query + '&offset=0&limit=20&type=track'
  };

  https.get(spotifyOptions, function(res) {
    let json = '';

    res.on('data', function(chunk) {
      json += chunk;
    });

    res.on('end', function() {
      callback(JSON.parse(json));
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

getRedditWeeklyPosts(function(songs){
  console.log(songs.filter(Boolean), songs.length);
});
