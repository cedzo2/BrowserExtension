// content.js
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "changePage") {
            var arr = [], l = document.links;
            // let link_content = []
            for (var i = 0; i < l.length; i++) {
                let link = l[i].href
                // remove login pages and jpgs 
                if(link.startsWith("https://en.m.wikipedia.org/wiki/") && !link.endsWith(".jpg")){
                    arr.push(link);
                    fetch(link,
                        {
                            method: 'get',
                            headers: {'Content-Type':'application/json'}
                        })
                        .then(response => {return response.text()})
                        .then(html => {
                        const parser = new DOMParser()
                        const doc = parser.parseFromString(html, 'text/html')
                        // remove nav and donation box 
                        if(doc.querySelector(`.mw-parser-output`)){
                            let body = doc.querySelector(`.mw-parser-output`).innerHTML
                            // remove css style 
                            body = String(body).replace(/<style.*?<\/style>/g, '')
                            // remove html tags 
                            const result = body.replace(/(<([^>]+)>)/gi, "").replace(/(^[ \t]*\n)/gm, "")
                            // scraping result here
                            alert(result)
                        }
                        })
                        }
            }
            alert(arr.length)
            let arrToString = JSON.stringify(arr);
            sendResponse({ text: arrToString, method: "changePage" });
        }
    }
);
