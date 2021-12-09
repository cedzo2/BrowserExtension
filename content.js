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

            //// Start BM25 ////
            // BM25
            var bm = new BM25;

            // Create some sample docs.
            let _outputs = ["water water water", "loo loo loo", "water loo"]

            // Add each document and corresponding document ID.
            for (let i = 0; i < _outputs.length; i++) {
                bm.addDocument({id: i, body: _outputs[i]})
            }

            // Update IDF.
            bm.updateIdf();

            // Find best match for "water". Documents with score of 0 are excluded.
            // Keys: id, tokens, body, termCount, terms, _score
            alert(bm.search("water")[0]["body"])
            alert(bm.search("water")[1]["body"])
            alert(bm.search("water")[2]["body"])
            //// End BM25 ////

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