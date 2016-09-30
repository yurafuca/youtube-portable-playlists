//TODO: アカウント切り替え
//TODO: relatedPlaylists.favoritesは自動生成されない

// Define some variables used to remember state.
var channelId, playlistId, nextPageToken, prevPageToken;

// After the API loads, call a function to get the uploads playlist ID.
function handleAPILoaded() {
  Loading.start();
  requestUserUploadsPlaylistId();
}

// Call the Data API to retrieve the playlist ID that uniquely identifies the
// list of videos uploaded to the currently authenticated user's channel.
function requestUserUploadsPlaylistId() {
  // See https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
    mine: true,
    part: 'contentDetails',
    maxResults: 10
  });
  request.execute(function(response) {
    channelId = response.result.items[0].id;
    playlistId = response.result.items[0].contentDetails.relatedPlaylists.favorites;
    console.log("contentDetails:");
    console.info(response.result.items[0].contentDetails.relatedPlaylists);
    requestUserPlayLists();
    requestVideoPlaylist(playlistId);
  });
}

function requestUserPlayLists() {
  var request = gapi.client.youtube.playlists.list({
    part: 'snippet',
    channelId: channelId
  });
  request.execute(function(response) {
    console.info(response);
    if (response.error) {
      $('#video-container').html('<div class="message">Sorry you have no channel. <a href="https://www.youtube.com/create_channel" target="_blank">Crate channel</a></div>');
      $('.post-auth').hide();
      Loading.done();
      return;
    }
    $.each(response.result.items, function(index, item) {
        displayPlaylist(item);
    });
    // var playlistItems = response.result.items;
    // if (playlistItems) {
    //   $.each(playlistItems, function(index, item) {
    //     displayResult(item.snippet);
    //   });
    // }
  });
}

// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId, pageToken) {
  $('#video-container').html('');
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

    var playlistItems = response.result.items;
    if (playlistItems) {
      $.each(playlistItems, function(index, item) {
        displayResult(item.snippet);
      });
    } else {
      $('#video-container').html('Sorry you have no uploaded videos');
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
  console.info(requestOptions);
  request.execute(function(response) {
    // Only show pagination buttons if there is a pagination token for the
    // next or previous page of results.
    console.info(response);
    // console.log(Date.parse(response.result.items[0].contentDetails.duration).getMinute());
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
    // .then(function(response) {
    //   console.info(response);
    // });

  request.execute(function(response) {
    console.log(response);
    var playlistItems = response.items;
    if (playlistItems) {
      $.each(playlistItems, function(index, item) {
        // item.resourceId.videoId = item.id.id;
        displayResult(item.snippet, item.id.videoId);
      });
    } else {
      $('#video-container').html('Not found.');
    }
    // var str = JSON.stringify(response.result);
    // $('#search-container').html('<pre>' + str + '</pre>');
  });
}

// Create a listing for a video.
function displayResult(videoSnippet, videoId) {
  makeVideoToDom(videoSnippet, videoId)
    .then(function(dom) {
      // console.log("Resolved dom");
      // console.info(dom);
      $('#video-container').append(dom);
    });
  console.info(videoSnippet);
  // var title = videoSnippet.title;
  // var videoId = videoSnippet.resourceId.videoId;
  // $('#video-container').append('<p>' + title + ' - ' + videoId + '</p>');
}

function displayPlaylist(playListItem) {
  let dom = $('<div class ="mylist"><span class="name"></span><span class="id"></span></div>');
  dom.find('.name').text(playListItem.snippet.title);
  dom.find('.id').text(playListItem.id);
  let hoge;
  $('#mylistgroup').append(dom);
}

function makeVideoToDom(videoSnippet, videoId) {
  return new Promise(function(resolve, reject) {
      let dom = $('<div class ="video"/>');
      dom.load(chrome.extension.getURL("/html/video.html"), function() {
        // if (videoSnippet)
        var title, id, thumbnail;
        // if (videoSnippet.snippet) {
        //   id = videoSnippet.id.videoId;
        //   title = videoSnippet.snippet.title;
        //   thumbnail = videoSnippet.snippet.thumbnails.high.url;
        // } else {
          title = videoSnippet.title;
          thumbnail = videoSnippet.thumbnails.medium.url;
          if (videoId) {
            id = videoId;
          } else {
            id = id = videoSnippet.resourceId.videoId;
          }
        // }
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
