// popup.js
document.addEventListener('DOMContentLoaded', function () {
    var checkButton = document.getElementById('searchbutton');
    checkButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "changePage" }, function (response) {
                if (response.method == "changePage") {
                    links = JSON.parse(response.text);
                }
                alert(links.join('\r\n'))

                scrape(links)
    
                async function scrape(array) {
                    let outputs = [];
                    await asyncForEach(array, async (u) => {
                        if(u.startsWith("https://en.m.wikipedia.org/wiki/") && !u.endsWith(".jpg")){
                            outputs.push(await generate(u))
                        }
                });
                    // results here
                    // console.log(outputs) 
                    // alert(outputs.join('\r\n'))
                    // alert("Ellie update")
                }
                

                async function asyncForEach(array, callback) {
                for (let index = 0; index < array.length; index++) {
                  await callback(array[index], index, array)
                }
                }

                async function generate(url) {
                    const result = await open_url(url);
                    return result;
                }

                async function open_url(url) {
                    alert(url)
                    const response = await fetch(url, {
                        mode: "no-cors"
                    }).catch((response_error) => console.error(`Error:`, response_error)
                  )
                  if (response.ok) {
                    const text = await response.text()
                    const parser = new DOMParser()
                    const doc = parser.parseFromString(text, `text/html`)
                    let body = doc.querySelector(`.mw-parser-output`).innerHTML
                    body = body.replace(/<style.*?<\/style>/g, '')
                    const result = body.replace(/(<([^>]+)>)/gi, "").replace(/(^[ \t]*\n)/gm, "")
                    return result
                  } else {
                    return `Error. Contact Ellie for debugging`;
                  }
                }
            });
        });
    }, false);
}, false);