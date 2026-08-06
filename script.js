for (let socialButton of document.getElementsByClassName("socialButton")) {
    socialButton.addEventListener("click", () => {
        let data = socialButton.dataset
        window.open(data?.href ?? "#", "_blank")
    })
}