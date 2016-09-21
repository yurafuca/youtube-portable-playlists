class YouTube
{
    constructor(initial = null) {
        this.source = initial;
    }

    static getPlayList(ytplaylistId, REQ_QTY, nextPageToken) {
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
