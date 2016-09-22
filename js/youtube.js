// Define some variables used to remember state.
var channelId, playlistId, nextPageToken, prevPageToken;

// After the API loads, call a function to get the uploads playlist ID.
function handleAPILoaded() {
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
    console.info(response);
    console.log('channelId: ' + response.result.items[0].id);
    channelId = response.result.items[0].id;
    playlistId = response.result.items[0].contentDetails.relatedPlaylists.favorites;
    requestUserPlayLists();
    requestVideoPlaylist(playlistId);
  });
}

function requestUserPlayLists() {
  var request = gapi.client.youtube.playlists.list({
    part: 'snippet',
    channelId: channelId,
    // id: 'RDg2WpG1e2V9s'
  });
  request.execute(function(response) {
    console.info(response);
    $.each(response.result.items, function(index, item) {
        displayPlaylist(item);
    });
  });
}

// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId, pageToken) {
  $('#video-container').html('');
  // watchHistory.length == 0 になる．
  // developers.google.com の embedded-explorer でも watchHistory.length == 0．
  // relatedPlaylists.watchHistory == 'HL'になっている．
  // YouTube API が明らかに未実装な箇所を抱えたまま放置されている．
  // watchLater も同様．
  // YouTube API はクソだ．
  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 50
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

// Create a listing for a video.
function displayResult(videoSnippet) {
  makeVideoToDom(videoSnippet)
    .then(function(dom) {
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
  // makeVideoToDom(videoSnippet)
  //   .then(function(dom) {
  //     $('#video-container').append(dom);
  //   });
  // console.info(videoSnippet);
  // var title = videoSnippet.title;
  // var videoId = videoSnippet.resourceId.videoId;
  // $('#video-container').append('<p>' + title + ' - ' + videoId + '</p>');
}

function makeVideoToDom(videoSnippet) {
  return new Promise(function(resolve, reject) {
      let dom = $('<div class ="video"/>');
      dom.load(chrome.extension.getURL("/html/video.html"), function() {
        dom.find('.title .playurl').text(videoSnippet.title);
        dom.find('.playurl').attr('href', "https://www.youtube.com/watch?v=" + videoSnippet.resourceId.videoId);
        dom.find('.thumbnail').css('background-image', `url(" ${videoSnippet.thumbnails.high.url} ")`);
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

$(function()
{
  $(document).on('click','#prev-button',function() {
    previousPage();
  });
    $(document).on('click','#next-button',function() {
    nextPage();
  });
});
