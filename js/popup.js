const bg = chrome.extension.getBackgroundPage();
const APIKEYFILE = "../apikey.json";

var nextPageToken = '';   //次のページをリクエストする時に渡すパラメータ
var totalResults = 0;   //再生リスト内の動画件数
var totalPage = 1;  //最大ページ
var currentPage = 0;  //現在のページ

var scrollHeight;
var scrollPosition;
var loadingFlg = false;

$(function()
{
	// var reader = new FileReader();
	// reader.readAsDataURL(APIKEYFILE);
	// reader.onload = function(ev) {
	// 	alert(reader.result);
	// };


   	getJsonData(APIKEYFILE)
		.then(function(_jsonData){
			ytApiKey = _jsonData.apiKey;
			ytApiUrl = _jsonData.reqUrl;
			ytPlaylistId = _jsonData.listId;
			console.log(ytApiKey);
			console.log(ytApiUrl);
			console.log(ytPlaylistId);
			YouTube.getPlayList(ytPlaylistId, 3, '')
				.then(function(_resData) {
					console.info(_resData);
				      nextPageToken = _resData.nextPageToken != undefined ? _resData.nextPageToken : '';
				      totalResults = _resData.pageInfo.totalResults;
				      totalPage = Math.ceil(totalResults / 3);

				      // insertVideo(_resData);
				      // loadingFlg = false;
				});
  	});

	// Promise.resolve()
	// 	.then(Loading.start)
	// 	.then(isLogined)
	// 		.catch(function(e) {
	// 			Loading.done();
	// 			showErrorMessage();
	// 			reject();
	// 		})
	// 	.then(bg.loadLiveStreams)
	// 	.then(function($videoInfos) {
	// 		return new Promise(function(resolve, reject) {
	// 			if ($videoInfos.length === 0) {
	// 				Loading.done();
	// 				showZeroMessage();
	// 				reject();
	// 			}
	// 			resolve($videoInfos);
	// 		});
	// 	})
	// 	.then(show)
	// 	.then(Loading.done);
});

function getJsonData(_url){
	console.log('getJsonData()開始：'+_url);
	var $dfd = $.Deferred();
	$.ajax({
	  url:_url,
	  dataType:'json',
	  cache:false,
	  timeout:15000
	})
	  .done(function(_data){
	  //console.log('json取得成功：'+_url);
	  $dfd.resolve(_data);
	})
	  .fail(function(_data){
	  console.log('json取得error：'+_url);
	  $dfd.reject(_data);
	})
	  .always(function(_data){
	  //console.log('getJsonData()終了：'+_url);
	});
	return $dfd.promise();
}

function show($doms)
{
	return new Promise(function(resolve, reject) {
		var length = $doms.length;
		$doms.each(function(index) {
			append($('#communities'), $(this));
			if (index == length - 1) {
				resolve();
			}
		});
	});
}

function showErrorMessage()
{
	var $message = $('<div class="message"></div>');
	$message.text('ニコニコ動画にログインしていません．ログインしてから再度試してください．');

	$('#communities').html($message);
}

function showZeroMessage()
{
	var $message = $('<div class="message"></div>');
	$message.text('放送中の番組がありません．');

	$('#communities').html($message);
}

function append($dom, $videoInfo)
{
	var thumbnail	= $videoInfo.find('community thumbnail').text();
	var title		= $videoInfo.find('video title').text();
	var id			= $videoInfo.find('video id').text();

	var $community = $('<div class="community"><a href="" target="_blank"><span class="thumbnail"></span></a></div>');

	$('.thumbnail', $community).css('background-image', 'url(' + thumbnail + ')');
	$('a', $community).attr('href', "http://live.nicovideo.jp/watch/" + id);

	$community.data('powertip', wordWrap(title, 16));
	
	$.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];
	$community.powerTip({
		smartPlacement: true,
		fadeInTime: 30,
		fadeOutTime: 30,
		closeDelay: 0,
		intentPollInterval: 0
	});

	$dom.append($community);
}

function wordWrap(text, length)
{
    reg = new RegExp("(.{" + parseInt(length) + "})", "g");
    return text.replace(/[\r|\r\n|\n]/g, "").replace(reg, "$1" + "<br>");
}

class Loading
{
	static start() {
		$('#communities').addClass('nowloading');
	}

	static done() {
		$('#communities').removeClass('nowloading');
	}
}