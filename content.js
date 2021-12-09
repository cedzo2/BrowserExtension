// content.js
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "changePage") {
            var arr = [], l = document.links;
            let short = Array.from(l)
            short = short.slice(0, 8)
            scrape(short)

            async function scrape(array) {
                let outputs = [];
                await asyncForEach(array, async (u) => {
                outputs.push(await generate(u))
            });
                // results here
                alert(outputs.length)
            }

            async function asyncForEach(array, callback) {
                for (let index = 0; index < array.length; index++) {
                  await callback(array[index], index, array)
                }
            }

            async function generate(url) {
                const result = await open_url(String(url));
                return result;
            }

            async function open_url(url) {
              if(url.startsWith("https://en.m.wikipedia.org/wiki/") && !url.endsWith(".jpg")){
                    arr.push(url)
                    const response = await fetch(url,
                        {
                            method: 'get',
                            headers: {'Content-Type':'application/json'}
                        }).catch((response_error) =>
                        console.error(`Error:`, response_error)
                    )
                     if (response.ok) {
                        const text = await response.text()
                        const parser = new DOMParser()
                        const doc = parser.parseFromString(text, `text/html`)
                          if(doc.querySelector(`.mw-parser-output`)){
                            let body = doc.querySelector(`.mw-parser-output`).innerHTML
                            // remove css style tags
                            body = String(body).replace(/<style.*?<\/style>/g, '')
                            // remove html tags 
                            const result = body.replace(/(<([^>]+)>)/gi, "").replace(/(^[ \t]*\n)/gm, "")
                            return result
                        }
                      }
              }
            }
         
            for (var i = 0; i < l.length; i++) {
                arr.push(l[i].href);
            }
            let arrToString = JSON.stringify(arr);
            sendResponse({ text: arrToString, method: "changePage" });
        }
    }
);