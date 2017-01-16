const https = require('https');
const fs = require('fs');
const spotifyWebApi = require('spotify-web-api-node');
const config = require('./config');

let spotifyApi = new spotifyWebApi({
  clientId : config.spotify.clientId,
  clientSecret : config.spotify.clientSecret,
  redirectUri : 'http://localhost:8888/callback'
});

spotifyApi.setAccessToken(config.spotify.accessToken);

function cleanRedditTitle(title) {
  return title.replace(/\[.*\]|\(.*\)/g, '');
}

function getTracklist(callback) {

  const options = {
    hostname: 'www.reddit.com',
    path: '/r/music/top.json?sort=top&t=week&limit=100'
  };

  https.get(options, function(res) {
    let json = '';

    res.on('data', function(chunk) {
      json += chunk;
    });

    res.on('end', function() {
      const list = JSON.parse(json);

      // fs.writeFile("wk1.json", json, function(err) {
      //      if(err) {
      //          return console.log(err);
      //      }
      //
      //      console.log("The file was saved!");
      //  });
      // const list = JSON.parse(fs.readFileSync('wk1.json', 'utf-8'));

      let songs = [];

      let length = 0;

      list.data.children.forEach(function(post, index){

        if (!post.is_self) {
          searchSpotifyTrack(encodeURIComponent(cleanRedditTitle(post.data.title)) ,function(searchResult){
            length++;

            if (searchResult && searchResult.tracks && searchResult.tracks.total && searchResult.tracks.total < 15) {
              songs[index] = 'spotify:track:' + searchResult.tracks.items[0].id;
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

getTracklist(function(songs){
  songs = songs.filter(Boolean);
  songs.length = 25;
  setTimeout(function(){
    // create playlist and add tracks
    // spotifyApi.createPlaylist(config.spotify.username, 'weekly r/music 2017 week #2', { 'public' : true })
    // .then(function(json) {
      spotifyApi.addTracksToPlaylist(config.spotify.username, '2loNlx87pVStZZUpeZJBtE', songs)
      .then(function(data) {
        console.log('Added tracks to playlist!');
      }, function(err) {
        console.log('Something went wrong!', err);
      })
    //   console.log('Created playlist!');
    // }, function(err) {
    //   console.log('Something went wrong!', err);
    // });

    //Remove tracks from a playlist
    // spotifyApi.getPlaylist(config.spotify.username, '7BUIzdR0WPuy7EsrFhHsUp')
    // .then(function(data) {
    //   spotifyApi.removeTracksFromPlaylistByPosition(config.spotify.username, data.body.id, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24], data.body.snapshot_id)
    //   .then(function(data) {
    //     console.log('Tracks removed from playlist!');
    //   }, function(err) {
    //     console.log('Something went wrong!', err);
    //   });
    // }, function(err) {
    //   console.log('Something went wrong!', err);
    // });
  },10000);
});
