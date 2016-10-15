//TODO: アカウント切り替え
//DONE: 左カラムをスクロール対応にする
//DONE: relatedPlaylists.favoritesは自動生成されない
//DONE: PLAY ALL

// Define some variables used to remember state.
var channelId, playlistId, nextPageToken, prevPageToken;

// After the API loads, call a function to get the uploads playlist ID.
function handleAPILoaded() {
  Loading.start();
  requestUserFavoritesPlaylistId();
  getUserDetails();
}

// function test(videoSnippet, videoId) {
//   return new Promise(function(resolve, reject) {
//       let dom = $('<div class ="video"/>');
//       dom.load("https://www.youtube.com/", function() {
//         let hoge = dom.find('.yt-thumb-clip img').attr('src');
//         console.log("YouTube");
//         console.log(hoge);
//       });
//   });
// }

// function test2(videoSnippet, videoId) {
//   return new Promise(function(resolve, reject) {
//     console.info(GoogleAuth.getId());
//     console.info(GoogleAuth.currentUser.get());
//   });
// }

function getUserDetails(videoSnippet, videoId) {
  var request = gapi.client.youtube.channels.list({
    part: 'snippet',
    mine: true
  });
  request.execute(function(response) {
    console.info(response);
    let avator_url = response.result.items[0].snippet.thumbnails.default.url;
    console.log(avator_url);
    $('#avator').attr('src', avator_url);
    $('#more-button').css('background-image', 'url(' + avator_url + ')');
    $('.account-name').html(response.result.items[0].snippet.title);
    // $('.account-email').html(response.result.items[0].id);
  });
  // signOut();
  // https://mail.google.com/mail/u/0/?logout

}

function signOut() {
  // Dosen't work gapi.aut.signOut;
  // gapi.auth.signOut();

  // gapi.auth2.setToken(gapi.auth.getToken());

  //     var auth2 = gapi.auth2.getAuthInstance();
  //   auth2.signOut().then(function () {
  //     console.log('User signed out.');
  //   });
  // location.reload();

  // let path = 'https://accounts.google.com/o/oauth2/revoke?token=' + gapi.auth.getToken().access_token;
  // var request = gapi.client.request(path, "POST");
  // request.execute(function(response) {
  //   console.log('User signed out.');
  //   console.info(response);
  // });

  //   return new Promise(function(resolve, reject) {
  //     let path = 'https://accounts.google.com/o/oauth2/revoke?token=' + gapi.auth.getToken().access_token;
  //     console.log(gapi.auth.getToken().access_token);
  //     $.get(path, function(response) {
  //         console.log(response);
  //         switch (response.status) {
  //             case 'ok':
  //                 resolve(true);
  //                 break;
  //             case 'fail':
  //                 resolve(false);
  //                 break;
  //         }
  //     }, 'json');            
  // });
}

// Call the Data API to retrieve the playlist ID that uniquely identifies the
// list of videos uploaded to the currently authenticated user's channel.
function requestUserFavoritesPlaylistId() {
  // See https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
    mine: true,
    part: 'contentDetails',
    maxResults: 10
  });
  request.execute(function(response) {
    channelId = response.result.items[0].id;
    // playlistId = response.result.items[0].contentDetails.relatedPlaylists.favorites;
    console.log("contentDetails:");
    console.info(response.result.items[0].contentDetails);
    requestUserPlayLists();
    // requestVideoPlaylist(playlistId);
  });
}

function requestUserPlayLists() {
  var request = gapi.client.youtube.playlists.list({
    part: 'snippet',
    channelId: channelId,
    maxResults: 50
  });
  request.execute(function(response) {
    console.info(response);
    if (response.error) {
      $('#video-container').html('<div class="message">Sorry you have no channel. <a href="https://www.youtube.com/create_channel" target="_blank">Crate a channel now.</a></div>');
      $('.post-auth').hide();
      Loading.done();
      return;
    }
    let length = response.result.items.length;
    if (length == 0) {
      $('#video-container').html(`<div class="message">Sorry you have no playlists. <a href="https://www.youtube.com/channel/${channelId}/playlists" target="_blank">Crate a playlist now.</a></div>`);
      $('.post-auth').hide();
      Loading.done();
      return;
    }
    let oldestItem = response.result.items[length - 1];
    requestVideoPlaylist(oldestItem.id);
    $.each(response.result.items, function(index, item) {
        displayPlaylist(item);
    });
  });
}

// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId, pageToken) {
  $('#video-container').html('');
  $('#mylisttitle').data('playlist-id', playlistId);
  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 27
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.playlistItems.list(requestOptions);
  console.info(requestOptions);
  request.execute(function(response) {
    // Only show pagination buttons if there is a pagination token for the
    // next or previous page of results.
    console.info(response);
    nextPageToken = response.result.nextPageToken;
    var nextVis = nextPageToken ? 'visible' : 'hidden';
    $('#next-button').css('visibility', nextVis);
    prevPageToken = response.result.prevPageToken
    var prevVis = prevPageToken ? 'visible' : 'hidden';
    $('#prev-button').css('visibility', prevVis);

    Loading.done();
    var playlistItems = response.result.items;
    if (playlistItems) {
      $.each(playlistItems, function(index, item) {
        displayResult(item.snippet);
      });
    } else {
      $('#video-container').html('<div class="message">There is no videos.</div>');
    }
  });
}

// Retrieve the list of videos in the specified playlist.
function requestVideo(videoId, videoDom, pageToken) {
  var requestOptions = {
    id: videoId,
    part: 'contentDetails, statistics',
    maxResults: 50
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.videos.list(requestOptions);
  // console.info(requestOptions);
  request.execute(function(response) {
    // Only show pagination buttons if there is a pagination token for the
    // next or previous page of results.
    // console.info(response);
    videoDom.find('.video_length').text(parseDuration(response.result.items[0].contentDetails.duration));
    videoDom.find('.viewcount').text(Number(response.result.items[0].statistics.viewCount).toLocaleString());

    // Ugly.
    Loading.done();
  });
}

function requestVideoSearch() {
  $('#video-container').html('');

  var q = $('#query').val();
  console.log('query:' + q);
  // APIs Explorer と gapi で異なる結果を返される．
  // var request = gapi.client.youtube.search.list({
  //   part: 'id, snippet',
  //   q: q,
  //   type: 'video'
  // });
  var endpoint = 'https://www.googleapis.com/youtube/v3/search';

  var params = '?part=' + 'id,snippet'
             + '&q=' + q
             + '&type=' + 'video'
             + '&maxResults=' + 18;

  var request = gapi.client.request(endpoint + params, 'GET');
  request.execute(function(response) {
    console.log(response);
    var playlistItems = response.items;
    if (playlistItems) {
      $.each(playlistItems, function(index, item) {
        displayResult(item.snippet, item.id.videoId);
      });
    } else {
      $('#video-container').html('Not found.');
    }
  });
}

// Create a listing for a video.
function displayResult(videoSnippet, videoId) {
  makeVideoToDom(videoSnippet, videoId).then(function(dom) {
      $('#video-container').append(dom);
  });
  // console.info(videoSnippet);
}

function displayPlaylist(playListItem) {
  let dom = $('<div class ="mylist"><span class="name"></span><span class="id"></span></div>');
  let title = playListItem.snippet.title;
  let id = playListItem.id;
  dom.find('.name').text(title);
  dom.find('.id').text(id);
  $('#mylistgroup').append(dom);
  $('#mylisttitle').text(title);
}

function makeVideoToDom(videoSnippet, videoId) {
  return new Promise(function(resolve, reject) {
      let dom = $('<div class ="video"/>');
      dom.load(chrome.extension.getURL("/html/video.html"), function() {
        var title, id, thumbnail;
          title = videoSnippet.title;
          thumbnail = videoSnippet.thumbnails.medium.url;
          if (videoId) {
            id = videoId;
          } else {
            id = id = videoSnippet.resourceId.videoId;
          }
        dom.find('.playurl').attr('href', "https://www.youtube.com/watch?v=" + id);
        dom.find('.title .playurl').text(title);
        dom.find('.thumbnail').css('background-image', `url(" ${thumbnail} ")`);
        requestVideo(id, dom);
        resolve(dom);
      });
  });
}

// Retrieve the next page of videos in the playlist.
function nextPage() {
  requestVideoPlaylist(playlistId, nextPageToken);
}

// Retrieve the previous page of videos in the playlist.
function previousPage() {
  requestVideoPlaylist(playlistId, prevPageToken);
}

function parseDuration(input) {
  var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  var hours = 0, minutes = 0, seconds = 0, totalseconds;
  var durationString = '';

  if (reptms.test(input)) {
    var matches = reptms.exec(input);
    if (matches[1]) hours = Number(matches[1]);
    if (matches[2]) minutes = Number(matches[2]);
    if (matches[3]) seconds = Number(matches[3]);
  }

  if (hours != 0) durationString += hours + ':';
                  durationString += minutes + ':';
                  durationString += ('0' + seconds).slice(-2);

  return durationString;
}

$(function()
{
  $(document).on('click','#prev-button',function() {
    previousPage();
  });
  
  $(document).on('click','#next-button',function() {
    nextPage();
  });
});
