const bg = chrome.extension.getBackgroundPage();
$(function()
{
	// Loading Google API JavaScript Client Library
	// Note: This solution is kind of hacky...
	 var head = document.getElementsByTagName('head')[0];
	 var script = document.createElement('script');
	 script.type = 'text/javascript';
	 script.src = "https://apis.google.com/js/client.js?onload=googleApiClientReady";
	 head.appendChild(script);

	let watchHistory = {name: 'History', id:'__HISTORY__'};
    $('#mylistgroup2').append(toDom(watchHistory).addClass('special history'));

    let savedPlaylists = {name: 'Watch Later', id:'__LATER__'};
    $('#mylistgroup2').append(toDom(savedPlaylists).addClass('special later'));

 
	// var reader = new FileReader();
	// reader.readAsDataURL(APIKEYFILE);
	// reader.onload = function(ev) {
	// 	alert(reader.result);
	// };

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

$(function()
{
	$(document).on('click','.mylist',function() {
		removeBackground();

		switch($(this).find('.id').text()) {
			case '__HISTORY__' :
				chrome.tabs.create({'url': 'https://www.youtube.com/feed/history'});
				break;
			case '__LATER__' :
				chrome.tabs.create({'url': 'https://www.youtube.com/playlist?list=WL'});
				break;
			default :
				requestVideoPlaylist($(this).find('.id').text());
				break;
		}
		
		// const dom 	  = new MyListView($(this));
		// const loading = new Loading($('#mylistitem'));
		// const id 	  = $(this).find('.id').text();
		// let getapi  = null;
		// if (id === 'deflist') {
		// 	getapi = Nicoapi.getDeflistItem;
		// } else {
		// 	getapi = Nicoapi.getMylistItem;
		// }
		// getapi(id).then(function(videos) {
		// 	MyListItemView.clear();
		// 	if (videos.length === 0) {
		// 		MyListItemView.message('NO_ITEM');
		// 	}
		// 	dom.select();
		// 	MyListItemView.show(videos);
		// });

    	$('#mylisttitle').text($(this).find('.name').text());
	});
});

function toDom(mylist) {
        let dom = $('<div class ="mylist"><span class="name"></span><span class="id"></span></div>');
        dom.find('.name').text(mylist.name);
        dom.find('.id').text(mylist.id);

        return dom;
    }

function removeBackground() {
	$('#mylistitem').removeClass('logoback');
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