// Query detection setup with the URL
const url = window.location.href;
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

                opacity: 1,
                boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.5)",

            },
            {
                offset: 0.5,

                opacity: 0.6,
                boxShadow: "0px 0px 5px 3px rgba(0, 0, 0, 0.5)",
            },
            {
                offset: 1,

                opacity: 1,
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
                transform: "scale(100%)",
            },
            {
                transform: "scale(101%)",
            },
            {
                transform: "scale(100%)",
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
}