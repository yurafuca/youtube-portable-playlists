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

	$('.pre-auth').hide();
    $('.post-auth').hide();

	let watchHistory = {name: 'History', id:'__HISTORY__'};
    $('#mylistgroup2').append(toDom(watchHistory).addClass('special history'));

    let watchLater = {name: 'Watch Later', id:'__LATER__'};
    $('#mylistgroup2').append(toDom(watchLater).addClass('special later'));
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

    	$('#mylisttitle').text($(this).find('.name').text());
	});

	$(document).on('click','#search-button',function() {
		removeBackground();
		requestVideoSearch();
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

function wordWrap(text, length)
{
    reg = new RegExp("(.{" + parseInt(length) + "})", "g");
    return text.replace(/[\r|\r\n|\n]/g, "").replace(reg, "$1" + "<br>");
}

class Loading
{
	static start() {
		$('#mylistitem').addClass('nowloading');
	}

	static done() {
		$('#mylistitem').removeClass('nowloading');
	}
}