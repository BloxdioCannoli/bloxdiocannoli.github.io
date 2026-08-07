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
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const codes = [
    {
        title: "67 Kill Codes",
        description: "3 codes (+1 bonus code) to kill 67's in Bloxd.io. Paste in 1 World Code and select any 4 ingame to use. Includes burning, miniguns, an infinite kill trap, and explosions.",
        tags: [{ name: "Test Tag 1" }, { name: "Test Tag 2" }],
        videos: ["https://youtube.com/@BloxdioCannoli"],
        thumbnail: "67trapthumbnail.png",
    }
]
function renderCodes(filter = null) {
    const codeSearchOutput = document.getElementById("codeSearchOutput");
    for (let codeNum in codes) {
        let code = codes[codeNum]
        let { title, description, tags, videos, thumbnail } = code;

        codeSearchOutput.insertAdjacentHTML("beforebegin", `
            <div class="section">
                <h1>${title}</h1>
                <i>${description}</i>

                <p class="buttonRow">
                <button class="socialButton youtube" id="viewVideo${codeNum}"><img src="/img/youtube-logo.png"> Watch on YouTube</button>
                <button class="socialButton code" id="viewCode${codeNum}"><img src="img/code-block.png"> View Full Code</button>
                </p>
            </div>
        `)

        let viewCode = document.getElementById(`viewCode${codeNum}`)
        let viewVideo = document.getElementById(`viewVideo${codeNum}`)

        viewCode.addEventListener("click", () => {
            // open code in full-screen mode
        })

        viewVideo.addEventListener("click", () => {
            window.open(videos[0], "_blank")
        })
    }
}


renderCodes()
if (path === "/codes/") {
    const codeSearchOutput = document.getElementById("codeSearchOutput");
    const codesSearchInput = document.getElementById("codesSearchInput")
    const submitCode = document.getElementById("submitCode")

    codesSearchInput.addEventListener("input", () => {
        if (codesSearchInput.value.length > 0) {
            submitCode.style.display = "block"
        } else {
            submitCode.style.display = "none"
        }
    })
    submitCode.addEventListener("click", () => {
        let value = codesSearchInput.value;

        renderCodes()
    })

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