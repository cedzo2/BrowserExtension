// content.js
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "changePage") {
            var arr = [], l = document.links;
            let short = Array.from(l)
            short = short.slice(0, 40)
            scrape(short).then(outputs => {
                let query = request.msg
                let score = []
                 // BM25
                let bm = new BM25;
                // Add each document and corresponding document ID.
                for (let i = 0; i < outputs.length; i++) {
                    bm.addDocument({id: outputs[i].url, body: outputs[i].webpage})
                }
                // Update IDF.
                bm.updateIdf();
                for (let i = 0; i < outputs.length; i++) {
                    if (bm.search(query)[i]){
                        let obj = {
                            url: bm.search(query)[i]["id"],
                            score: bm.search(query)[i]["_score"]
                        }
                        score.push(obj)
                    }
                }

                score.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

                alert(JSON.stringify(score))

                // Find best match for "water". Documents with score of 0 are excluded.
                // Keys: id, tokens, body, termCount, terms, _score
                // alert(bm.search(query)[0]["body"])
                // alert(bm.search(query)[0]["_score"])
                // alert(bm.search(query)[1]["body"])
                // alert(bm.search(query)[1]["_score"])
                //// End BM25 ////
            })
            

            async function scrape(array) {
                let outputs = [];
                await asyncForEach(array, async (u) => {
                    let back = await generate(u)
                    if(back && outputs.indexOf(back) === -1){
                       outputs.push(back)  
                    }
                
            });
                // results here
                return outputs
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
                            const obj = {
                                url: url,
                                webpage: result
                            }
                            return obj
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