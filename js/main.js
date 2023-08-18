function saveToDo() {
    let status = document.getElementById("status")
    status.innerText = "Saving..."
    let sections = document.getElementById("sections")
    let sectionTexts = sections.getElementsByClassName("section-text")
    let todoList = []
    for (let i = 0; i < sectionTexts.length; i++) {
        let sectionText = sectionTexts[i]
        let value = encodeURIComponent(sectionText.value)
        todoList.push(value)
    }
    let value = encodeURIComponent(todoList.join("\n\n"))
    localStorage.setItem("todo", value)
    status.innerText = "Saved!"
}

function loadToDo() {
    let value = localStorage.getItem("todo")
    if (value !== null) {
        value = decodeURIComponent(value)
        let todoList = value.split("\n\n")
        for (let i = 0; i < todoList.length; i++) {
            let section = addSection()
            let sectionText = section.getElementsByClassName("section-text")[0]
            sectionText.value = decodeURIComponent(todoList[i])
            autoAdjustTextareaHeight(sectionText)
        }
    } else {
        addSection()
    }
}

function autoAdjustTextareaHeight(textarea) {
    textarea.style.height = "0px"
    textarea.style.height = textarea.scrollHeight + "px"
}

function checkSingleInstance() {
    let currentInstanceId = parseInt(localStorage.getItem("currentInstanceId"))
    if (currentInstanceId !== window.currentInstanceId) {
        let todo = document.getElementById("todo")
        todo.disabled = true

        let status = document.getElementById("status")
        status.innerText = "Another instance of this app is running. Reload the page if you want to continue editing"
        status.className = "status right red"
    }
}

function addSection() {
    // Create <textarea id="section-text" class="full-width section-text" autocomplete="off" rows="1"></textarea>
    let textarea = document.createElement("textarea")
    textarea.className = "full-width section-text"
    textarea.autocomplete = "off"
    textarea.rows = "1"
    textarea.oninput = function () {
        autoAdjustTextareaHeight(textarea)
        saveToDo()
    }

    let deleteButton = document.createElement("button")
    deleteButton.className = "section-delete"
    deleteButton.innerText = "X"
    deleteButton.onclick = function () {
        let sections = document.getElementById("sections")
        sections.removeChild(section)
        saveToDo()
    }
    deleteButton.tabIndex = "-1"

    let section = document.createElement("div")
    section.className = "hcontainer full-width section"
    section.appendChild(textarea)
    section.appendChild(deleteButton)

    let sections = document.getElementById("sections")
    sections.appendChild(section)

    return section
}

function initialize() {
    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.key === "s") {
            event.preventDefault()
            saveToDo()
        }
    })

    loadToDo()
    let currentInstanceId = localStorage.getItem("currentInstanceId")
    if (currentInstanceId === null) {
        currentInstanceId = 0
    } else {
        currentInstanceId = parseInt(currentInstanceId) + 1
    }
    localStorage.setItem("currentInstanceId", currentInstanceId)
    window.currentInstanceId = currentInstanceId
    let status = document.getElementById("status")
    status.innerText = "Loaded!"

    window.checkSingleInstanceInterval = setInterval(checkSingleInstance, 1000)

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/todo/service_worker.js").then((registration) => {
            registration.update()
        })
    }
}

window.onload = initialize
