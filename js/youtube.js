// Define some variables used to remember state.
var playlistId, nextPageToken, prevPageToken;

// After the API loads, call a function to get the uploads playlist ID.
function handleAPILoaded() {
  requestUserUploadsPlaylistId();
}

function requestUserUploadsPlaylistId() {
      // See https://developers.google.com/youtube/v3/docs/channels/list
      var request = gapi.client.youtube.channels.list({
        mine: true,
        part: 'contentDetails'
      });
      request.execute(function(response) {
        playlistId = response.result.items[0].contentDetails.relatedPlaylists.favorites;
        requestVideoPlaylist(playlistId);
      });
    }

    // Retrieve the list of videos in the specified playlist.
  function requestVideoPlaylist(playlistId, pageToken) {
  $('#video-container').html('');
  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 10
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.playlistItems.list(requestOptions);
  console.log('Execute');
  request.execute(function(response) {
    // Only show pagination buttons if there is a pagination token for the
    // next or previous page of results.
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
  var title = videoSnippet.title;
  var videoId = videoSnippet.resourceId.videoId;
  $('#video-container').append('<p>' + title + ' - ' + videoId + '</p>');
  console.info($('#video-container'));
}


    function getPlayList(ytplaylistId, REQ_QTY, nextPageToken) {
        //console.log('getPlayList()開始：'+ytApiUrl);
        var $dfd = $.Deferred();

        $.ajax({
          type: 'get',
          url: ytApiUrl,
          dataType:'json',
          data: {
            part: 'snippet',
            playlistId : ytPlaylistId,  //再生リストのID
            maxResults : REQ_QTY,   //取得件数
            pageToken : nextPageToken,  //総件数が取得件数以上の時に続きのデータを取得するためのパラメータ
            key: ytApiKey       //APIキー
          },
          dataType: 'json',
          cache: false,
          timeout: 15000
        })
          .done(function(_data) {
          //console.log('再生リスト取得成功：' + ytApiUrl);
          $dfd.resolve(_data);
        })
          .fail(function(_data) {
          console.log('再生リスト取得error：' + ytApiUrl);
          $dfd.reject(_data);
        })
          .always(function(_data) {
          //console.log('getPlayList()終了：' + ytApiUrl);
        });

        return $dfd.promise();
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



class YouTube
{
    constructor(initial = null) {
        this.source = initial;
    }


    // TODO: validation.
    setSource(idList) {
        this.source = idList;
    }

    isNew(community) {
        if (this.source == null) {
            // dont show notification.
            return false;
        }
        // alert("hoge");
        let id = $(community).find('id').text();
        let inarray = $.inArray(parseInt(id), this.source);
        // console.log(this.toBool(1));
        // console.log(this.toBool(inarray));
        return !this.toBool(inarray);
    }

    toBool(value) {
        if (value == -1) return false;
        return true;
    }
}
