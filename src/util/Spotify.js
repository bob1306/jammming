let accessToken;
let expiresIn;
const redirectUri = 'http://localhost:3000/';
const clientId = 'd1c71e4e71834211a5ddf438427205f1';
const url = 'https://api.spotify.com/v1/search?';

let Spotify = {
  getAccessToken() {
    if(accessToken) {
      return accessToken;
    } else if (window.location.href.match(/access_token=([^&]*)/)&&window.location.href.match(/expires_in=([^&]*)/)) {
      const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
      const expireInMatch = window.location.href.match(/expires_in=([^&]*)/);
      console.log(accessTokenMatch, expireInMatch);
      accessToken = accessTokenMatch[1];
      expiresIn = expireInMatch[1];

      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      const endpoint = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = endpoint;
    };
  },
  search(term) {
    accessToken = Spotify.getAccessToken();
    const endpointUrl = `${url}type=track&q=${term}`;
    fetch(endpointUrl, {
      headers: {Authorization: `Bearer ${accessToken}`}
    }).then(response => {
      if(response.ok) {
        return response.json();
      }
      throw new Error('Request failed!');
    }, networkError => console.log(networkError.message)
  ).then(jsonResponse => {
    if(jsonResponse.tracks) {
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    } else {
      return [];
    }
  });
  },
  savePlaylist(playlistName, trackURIs) {
    if(!playlistName||trackURIs) {
      return;
    };
      let accessToken = this.getAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`
      };
      let userId;
      let playlistId;

      return fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => {
        if(response.ok) {
          return response.json();
        }
        throw new Error('Request failed!');
      }, networkError => console.log(networkError.message)
    ).then(jsonResponse => {
      userId = jsonResponse.id;
    });

    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({name: playlistName})
    }).then(response => {
      if(response.ok) {
        return response.json();
      }
      throw new Error('Request failed!');
    }, networkError => console.log(networkError.message)
  ).then(jsonResponse => {
    playlistId = jsonResponse.id;
  })
  }
};

export default Spotify;