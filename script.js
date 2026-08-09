/*
Created by Bloxdio Cannoli
*/

// Some helper functions
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isDeepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || obj1 === null ||
        typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!isDeepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}

function objectIsInsideArrayOfObjects(object, array) {
    return array.some(item => isDeepEqual(item, object));
}

// Query detection setup with the URL
const url = window.location.href;
const path = window.location.pathname;
var splitPath = path.split("/"); splitPath = splitPath.slice(1, splitPath.length - 1)

let queryString = url.split("?")[1]?.split("#")[0];
let queryObject = {};

if (queryString) {
    queryObject = queryStringToQueryObject(queryString)
}

function queryStringToQueryObject(queryString) {
    let queryObject = {};
    queryString = queryString.split(",")

    for (let part of queryString) {
        if (part.includes("=")) {
            part = part.split("=");
            queryObject[part[0]] = part[1];
        } else {
            queryObject[part] = true;
        }
    }

    return queryObject;
}

function queryObjectToQueryString(queryObject) {
    let params = "";
    for (let key in queryObject) {
        if (queryObject[key] === true) {
            params += `${key},`
        } else {
            params += `${key}=${queryObject[key]},`
        }
    }

    return `${params.slice(0, params.length - 1)}`;
}

// Sections
globalThis.sections = {}
for (let section of document.getElementsByClassName("section")) {
    let data = section.dataset
    let sectionName = data?.section

    let selectedSection = queryObject.section

    if (!sectionName) { continue }
    let isSelected = sectionName === selectedSection
    sections[sectionName] = {
        elem: section,
        isSelected,
    }

    if (isSelected) {
        section.animate([
            {
                offset: 0,

                //opacity: 1,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.5)",

            },
            {
                offset: 0.5,

                //opacity: 0.6,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                boxShadow: "0px 0px 5px 3px rgba(0, 0, 0, 0.3)",
            },
            {
                offset: 1,

                //opacity: 1,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.5)",
            }
        ], {
            duration: 1500,
            iterations: 3,
            easing: "ease-in-out"
        })

        section.scrollIntoView();
    }
}

// Social button activation
for (let socialButton of document.getElementsByClassName("socialButton")) {
    let data = socialButton.dataset
    socialButton.addEventListener("click", () => {
        window.open(data?.href ?? "#", "_blank")
    })
}

// FAQ button activation
let faqSelect = queryObject.faqSelect
faqSelect = decodeURIComponent(faqSelect).toLowerCase().replaceAll("_", " ").replaceAll("+", " ")

for (let faqGroup of document.getElementsByClassName("faq")) {
    let header = faqGroup.getElementsByClassName("faq-header")[0]
    let content = faqGroup.getElementsByClassName("faq-content")[0]

    let innerHTML = header.innerHTML
    header.innerHTML = `<img src="img/white-arrow.png" class="faq-arrow"> ${innerHTML}`

    text = innerHTML.toLowerCase().replace("?", "")

    function hideFaqContent(content, header) {
        content.style.display = "none"
        header.className = "faq-header"
    }

    function showFaqContent(content, header) {
        content.style.display = "block"
        header.className = "faq-header selected"
    }

    if (text === faqSelect) {
        showFaqContent(content, header)

        faqGroup.animate([
            {
                border: "5px dashed rgba(0, 0, 0, 0)",
                padding: "5px",
                //transform: "scale(100%)",
            },
            {
                border: "5px dashed rgb(255, 255, 255)",
                padding: "5px",
                //transform: "scale(101%)",
            },
            {
                border: "5px dashed rgba(0, 0, 0, 0)",
                padding: "5px",
                //transform: "scale(100%)",
            }
        ], {
            duration: 1500,
            iterations: 3,
            easing: "ease-in-out"
        })
    } else {
        hideFaqContent(content, header)
    }

    header.addEventListener("click", () => {
        let display = content.style.display
        if (display === "none") {
            showFaqContent(content, header)
        } else {
            hideFaqContent(content, header)
        }
    })

    header.addEventListener("mouseenter", () => {
        let display = content.style.display;

        header.classList.toggle("previewShow", display === "none");
        header.classList.toggle("previewHide", display !== "none");
    });

    header.addEventListener("mouseleave", () => {
        header.classList.remove("previewShow", "previewHide");
    });
}

// Search
if (path === "/codes/") {
    const codes = [
        {
            title: "67 Kill Codes",
            description: "3 codes (+1 bonus code) to kill 67's in Bloxd.io. Paste in 1 World Code and select any 4 ingame to use. Includes burning, miniguns, an infinite kill trap, and explosions.",
            tags: [{ name: "Anti-Brainrot", type: "antibrainrot" }, { name: "New", type: "new" }],
            videos: ["https://youtube.com/@BloxdioCannoli"],
            thumbnail: "67trapthumbnail.png",
        },
        {
            title: "Test Code",
            description: "eeeee",
            tags: [{ name: "Test2", type: "antibrainrot" }, { name: "Test" }, { name: "Anti-Brainrot", type: "antibrainrot" }],
            videos: ["https://youtube.com/@BloxdioCannoli"],
            thumbnail: "67trapthumbnail.png",
        },
    ]
    // initialize dynamic tags
    const deselectedTags = []
    for (let code of codes) {
        for (let tag of code.tags) {
            if (!objectIsInsideArrayOfObjects(tag, deselectedTags ?? [])) {
                deselectedTags.push(tag)
            }
        }
    }

    function renderCodes(filter = {}) {
        const codeSearchOutput = document.getElementById("codeSearchOutput");
        codeSearchOutput.innerHTML = ""

        // iterate through `codes` object[]
        codeSearchOutput.insertAdjacentHTML("beforeend", `
        <div id="resultNofif">

        </div>
    `)
        let results = 0;
        for (let codeNum in codes) {
            let code = codes[codeNum]
            let { title, description, tags, videos, thumbnail } = code;

            let tagsRawText = ``
            for (let tag of tags) {
                let { name } = tag;

                tagsRawText += name
            }
            //let toSearch = `${title}${description}${tagsRawText}${videos.join("")}`.toLowerCase()

            let contents = {}
            for (type in code) { contents[type] = code[type] }
            // filter if needed
            if (filter) {
                let { filterType, shouldInclude, needsTags } = filter
                if (shouldInclude) {
                    shouldInclude = shouldInclude.toLowerCase()
                    let included = false;

                    let searchList = [{ name: "title", contents: title }, { name: "description", contents: description }, { name: "videos", contents: videos.join("") }]
                    searchList.forEach((val, idx, arr) => { arr[idx].contents = val.contents.toLowerCase() })
                    let matchPositions = []
                    for (let search of searchList) {
                        let { name } = search
                        let toSearch = search.contents
                        matchPositions[name] = []

                        let startIdx = 0;
                        let shouldIncludeLetterNum = 0;
                        let maxSearchLength = shouldInclude.length
                        for (let targetLetterNum in toSearch) {
                            let targetLetter = toSearch[targetLetterNum]
                            let shouldIncludeLetter = shouldInclude[shouldIncludeLetterNum]

                            if (targetLetter === shouldIncludeLetter) {
                                if (shouldIncludeLetterNum == maxSearchLength - 1) {
                                    // found match!
                                    let matchStart = targetLetterNum - shouldIncludeLetterNum
                                    let matchEnd = Number(targetLetterNum)
                                    matchPositions[name].push([matchStart, matchEnd])
                                    shouldIncludeLetterNum = 0;

                                    included = true;
                                    //break;
                                } else {
                                    shouldIncludeLetterNum++;
                                }
                            } else {
                                shouldIncludeLetterNum = 0;
                            }
                        }
                    }

                    if (!included) { continue }

                    let dontHighlight = ["videos", "thumbnail", "tags"]
                    // loop through matches by name

                    for (let matchType in matchPositions) {
                        if (dontHighlight.includes(matchType)) { continue };

                        let targetPositions = matchPositions[matchType];

                        // merging for edge cases to prevent weird html artifacts on overlap
                        targetPositions.sort((a, b) => a[0] - b[0]);
                        let mergedPositions = [];

                        for (let [start, end] of targetPositions) {
                            let last = mergedPositions[mergedPositions.length - 1];

                            if (last && start <= last[1] + 1) {
                                last[1] = Math.max(last[1], end);
                            } else {
                                mergedPositions.push([start, end]);
                            }
                        }
                        let targetText = code[matchType].split("");

                        // loop through the match positions
                        for (let i = mergedPositions.length - 1; i >= 0; i--) {
                            let [start, end] = mergedPositions[i];

                            targetText.splice(end + 1, 0, `</span>`);
                            targetText.splice(start, 0, `<span class="searchHighlight ${matchType}">`);
                        }

                        targetText = targetText.join("");
                        contents[matchType] = targetText;

                        // logging because building a custom search engine is painful
                        /*console.log(`


Target: ${targetText}

Type: ${matchType}

Positions: ${targetPositions.join("|")}

Text: ${shouldInclude}
`)*/
                    }
                }


                // a code must include all of the tags
                if (needsTags) {
                    let hasAll = true;
                    for (let tag of needsTags) {
                        if (!objectIsInsideArrayOfObjects(tag, tags ?? [])) { hasAll = false; break; }
                    }
                    if (!hasAll) { continue }
                }
            }
            results++;

            // initial tag processing, per-code result
            let tagsHTML = ``
            for (let tagNum in tags) {
                let tag = tags[tagNum]
                let { name, type } = tag;

                tagsHTML += `<span id="codePreviewTag${codeNum}${tagNum}" class="codePreviewTag notClickable${type ? ` ${type}` : ""}">${name}</span>`
            }
            // insert html
            codeSearchOutput.insertAdjacentHTML("beforeend", `
            <div class="section searchResult">
                <h1>${contents.title}</h1>
                <p class="codePreviewTagGroup">
                ${tagsHTML}
                </p>

                <p class="codePreviewDescription">${contents.description}</p>

                <p class="buttonRow">
                <button class="socialButton youtube" id="viewVideo${codeNum}"><img src="/img/youtube-logo.png"> Watch on YouTube</button>
                <button class="socialButton code" id="viewCode${codeNum}"><img id="viewCodeImg${codeNum}" src="img/code-block.png"> View Full Code</button>
                </p>
            </div>
        `)
            // configure tags
            for (let tagNum in tags) {
                let tagElem = document.getElementById(`codePreviewTag${codeNum}${tagNum}`)
                tagElem.addEventListener("click", () => {
                    // select the tag
                })
            }

            let viewCode = document.getElementById(`viewCode${codeNum}`)
            let viewVideo = document.getElementById(`viewVideo${codeNum}`)
            let viewCodeImg = document.getElementById(`viewCodeImg${codeNum}`)

            viewCode.addEventListener("click", () => {
                // open code in full-screen mode
            })

            viewCode.addEventListener("mouseenter", () => {
                viewCodeImg.src = "img/code-block-spin.gif"
            })
            viewCode.addEventListener("mouseleave", () => {
                viewCodeImg.src = "img/code-block.png"
            })


            viewVideo.addEventListener("click", () => {
                window.open(videos[0], "_blank")
            })
        }
        let { needsTags } = filter
        needsTags = needsTags ?? []
        let tagsPrettyRawText = ``
        for (let tagNum in needsTags) {
            let tag = needsTags[tagNum]
            let { name } = tag;

            if (tagNum == 0) {
                tagsPrettyRawText += `"${name}"`
            } else if (tagNum == needsTags.length - 1) {
                tagsPrettyRawText += `, and "${name}"`
            } else {
                tagsPrettyRawText += `, "${name}"`

            }
        }

        // search confirmation update
        const resultNofif = document.getElementById("resultNofif");
        const { shouldInclude } = filter
        if (shouldInclude || needsTags?.length > 0) {
            resultNofif.className = "section"
            resultNofif.innerHTML = `
    <i>Found <b>${results}</b> result${results === 1 ? '' : 's'}${shouldInclude ? ` including "${shouldInclude}"` : ''}${needsTags.length > 0 ? ` ${shouldInclude ? 'and ' : ''} having the ${tagsPrettyRawText} tag${needsTags.length === 1 ? '' : 's'}` : ''}.</i>
    `
        }
    }

    const selectTags = document.getElementById("selectTags")
    const addTagFilter = document.getElementById("addTagFilter")
    const removeTagFilter = document.getElementById("removeTagFilter")

    function attemptAddTagFilter(tag) {
        if (!filter.needsTags) { filter.needsTags = [] }
        // add to tag filter
        if (!objectIsInsideArrayOfObjects(tag, filter.needsTags ?? [])) {
            filter.needsTags.push(tag)
            updateTagFilterDisplay()
        }

        // remove from deselectedTags
        if (objectIsInsideArrayOfObjects(tag, deselectedTags)) {
            const tagIndex = deselectedTags.indexOf(tag);
            if (tagIndex !== -1) {
                deselectedTags.splice(tagIndex, 1);
            }

            updateTagFilterDisplay();
        }
    }

    function attemptRemoveTagFilter(tag) {
        if (!filter.needsTags) { filter.needsTags = [] }
        // remove from tag filter
        if (objectIsInsideArrayOfObjects(tag, filter.needsTags ?? [])) {
            let needsTags = filter.needsTags

            const tagIndex = needsTags.indexOf(tag);
            if (tagIndex !== -1) {
                filter.needsTags.splice(tagIndex, 1);
            }

            updateTagFilterDisplay();
        }

        // add to deselected tags
        if (!objectIsInsideArrayOfObjects(tag, deselectedTags ?? [])) {
            deselectedTags.push(tag)
            updateTagFilterDisplay()
        }
    }

    function tagClickAction(tag) {
        if (objectIsInsideArrayOfObjects(tag, filter.needsTags ?? [])) {
            selected = true
        } else {
            selected = false
        }
        if (selected) {
            attemptRemoveTagFilter(tag)
        } else {
            attemptAddTagFilter(tag)
        }

        renderCodes(filter)
    }

    function updateTagFilterDisplay() {
        addTagFilter.innerHTML = "";
        removeTagFilter.innerHTML = "";

        let { needsTags } = filter

        let areDeselectedTags = deselectedTags.length > 0
        let areSelectedTags = needsTags?.length > 0

        // iterate through selected tags that filter
        if (areDeselectedTags) {
            addTagFilter.style.display = "inline-flex"

            for (let tagNum in deselectedTags) {
                let tag = deselectedTags[tagNum]
                let { type, name, selected } = tag;

                addTagFilter.insertAdjacentHTML("afterbegin",
                    `<span id="filterTag${tagNum}" class="codePreviewTag${type ? ` ${type}` : ""}">${name} (+)</span>`)

                let tagElem = document.getElementById(`filterTag${tagNum}`);
                tagElem.addEventListener("click", () => tagClickAction(tag))
            }
        } else {
            addTagFilter.style.display = "none"
        }

        // iterate through deselected tags that do not filter
        if (areSelectedTags) {
            removeTagFilter.style.display = "inline-flex"
            for (let tagNum in needsTags) {
                let tag = needsTags[tagNum]
                let { type, name, selected } = tag;

                removeTagFilter.insertAdjacentHTML("afterbegin",
                    `<span id="filterTag${tagNum}" class="codePreviewTag${type ? ` ${type}` : ""}">${name} (x)</span>`)

                let tagElem = document.getElementById(`filterTag${tagNum}`);
                tagElem.addEventListener("click", () => tagClickAction(tag))
            }
        } else {
            removeTagFilter.style.display = "none"
        }

        const tagDivider = document.getElementById("tagDivider")
        if (areDeselectedTags && areSelectedTags) {
            tagDivider.style.display = "inline-block"
        } else {
            tagDivider.style.display = "none"
        }
    }

    let filter = {}

    updateTagFilterDisplay()
    renderCodes()

    // Searching for codes
    const codeSearchOutput = document.getElementById("codeSearchOutput");
    const codesSearchInput = document.getElementById("codesSearchInput")
    const clearSearch = document.getElementById("clearSearch")

    codesSearchInput.addEventListener("input", (e) => {
        let key = e.key
        if (key === "Enter" || true) {
            let value = codesSearchInput.value;

            filter.shouldInclude = value
            renderCodes(filter)
        }
    })

    clearSearch.addEventListener("click", () => {
        codesSearchInput.value = ""
        filter.shouldInclude = null
        renderCodes(filter)
    })

    setInterval(() => {
        const searchVal = codesSearchInput.value
        const searchLen = searchVal.length
        if (filter.shouldInclude) {
            clearSearch.style.display = "block"
        } else {
            clearSearch.style.display = "none"
        }
    }, 100)


    // Typing animation
    let searchPlaceholders = ["Search by name", "Search by description", "Search by video URL", "Search by tags"]
    let placeInSearchPlaceholdersArray = 0;
    let placeInSearchPlaceholder = 0;
    let typingMode = "add"

    function typeInSearchInput() {
        let waitFor;
        let fullPlaceholder = searchPlaceholders[placeInSearchPlaceholdersArray]

        codesSearchInput.placeholder = fullPlaceholder.slice(0, placeInSearchPlaceholder)

        if (typingMode === "add") {
            placeInSearchPlaceholder++;
            waitFor = random(100, 280);
        } else if (typingMode === "delete") {
            placeInSearchPlaceholder--;
            waitFor = random(100, 110);
        }

        if (placeInSearchPlaceholder > fullPlaceholder.length) {
            typingMode = "delete"
            waitFor = random(800, 1000)
        }

        if (placeInSearchPlaceholder <= 0 && typingMode === "delete") {
            typingMode = "add"
            placeInSearchPlaceholdersArray = (placeInSearchPlaceholdersArray + 1) % searchPlaceholders.length;
            placeInSearchPlaceholder = 0;
        }

        setTimeout(() => {
            typeInSearchInput()
        }, waitFor);
    }
    typeInSearchInput()
}

// Footer
document.querySelector(".section-cont").insertAdjacentHTML("beforeend", `
    <div class="footer-container">
        <div class="footer">
            Site coded by Bloxdio Cannoli. Background image is a screenshot of
            <a href="https://bloxd.io/game/classic_playerSchematic%7C9ro670z2AICkQXWaRuILD" target="_blank">TestMode</a>,
            taken by Bloxdio Cannoli. Assets such as the white arrow are from <a href="https://bloxd.io" target="_blank">bloxd.io</a>. Contact me on Reddit or Discord for questions.
            Please email me at BloxdioCannoli@proton.me for serious concerns.
        </div>
    </div>
`);