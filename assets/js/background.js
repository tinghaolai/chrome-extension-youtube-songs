chrome.runtime.onInstalled.addListener(function() {

});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.url) {
            // do something here
            console.log('onUpdated change url');
            console.log(changeInfo.url);
            console.log('tadId');
            console.log(tabId);

            let videoId = new URL(changeInfo.url).searchParams.get('v');
            if (videoId) {
                chrome.storage.sync.get('songs', data => {
                    if (
                        (data.songs) &&
                        (data.songs.find(song => song.videoId === videoId))
                    ) {
                        chrome.browserAction.setIcon({ path: '../images/song-icon-green.jpg', tabId: tabId});
                    } else {
                        chrome.browserAction.setIcon({ path: '../images/song-icon.jpg', tabId: tabId});
                    }
                });
            }
        }
    }
);
