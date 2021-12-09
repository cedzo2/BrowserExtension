// popup.js
document.addEventListener('DOMContentLoaded', function () {
    var checkButton = document.getElementById('searchbutton');
    checkButton.addEventListener('click', function () {
        let query = document.getElementById('query').value
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "changePage", msg: query }, function (response) {
                if (response.method == "changePage") {
                    links = JSON.parse(response.text);
                }
                alert(links.join('\r\n'))
            });
        });
    }, false);
}, false);