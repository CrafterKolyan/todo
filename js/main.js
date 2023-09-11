class State {
    static #instance = null

    static getInstance() {
        if (State.#instance === null) {
            State.#instance = State.#fromLocalStorage()
        }
        return State.#instance
    }

    static #tryLoadUnversionedState() {
        let state = localStorage.getItem("todo")
        if (state !== null) {
            state = decodeURIComponent(state)
            let todoList = state.split("\n\n").map((item) => decodeURIComponent(item))
            state = {
                version: "0",
                todo: todoList
            }
        }
        return state
    }

    static #tryLoadVersionedState() {
        let state = localStorage.getItem("state")
        if (state !== null) {
            state = JSON.parse(state)
            return state
        }
        return null
    }

    static #fromLocalStorage() {
        let state = State.#tryLoadVersionedState()
        if (state !== null) {
            return state
        }
        state = State.#tryLoadUnversionedState()
        if (state !== null) {
            state = {
                version: "1",
                todo: state.todo
            }
            return state
        }
        return null
    }

    static update() {
        let state = State.getInstance()
        let sections = document.getElementById("sections")
        let sectionTexts = sections.getElementsByClassName("section-text")
        let todoList = []
        for (let i = 0; i < sectionTexts.length; i++) {
            let sectionText = sectionTexts[i]
            let value = sectionText.value
            todoList.push(value)
        }
        state.todo = todoList
        State._instance = state
        State.toLocalStorage()
    }

    static toLocalStorage() {
        localStorage.setItem("state", JSON.stringify(this.getInstance()))
    }
}

currentlySelectedVerticalLine = null

function saveState() {
    let status = document.getElementById("status")
    status.innerText = "Saving..."
    State.update()
    status.innerText = "Saved!"
}

function loadState() {
    let state = State.getInstance()
    if (state !== null) {
        let todoList = state.todo
        for (let i = 0; i < todoList.length; i++) {
            let section = addSection()
            let sectionText = section.getElementsByClassName("section-text")[0]
            sectionText.value = todoList[i]
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
        Array.from(document.getElementsByTagName("textarea")).forEach((textarea) => {
            textarea.disabled = true
        })
        Array.from(document.getElementsByTagName("button")).forEach((button) => {
            button.disabled = true
        })

        let status = document.getElementById("status")
        status.innerText = "Another instance of this app is running. Reload the page if you want to continue editing"
        status.className = "header-block right red"
    }
}

function addSection() {
    let verticalLine = document.createElement("div")
    verticalLine.className = "vertical-line"

    let textarea = document.createElement("textarea")
    textarea.className = "full-width section-text"
    textarea.autocomplete = "off"
    textarea.rows = "1"
    textarea.oninput = function () {
        autoAdjustTextareaHeight(textarea)
        saveState()
    }
    textarea.addEventListener("focus", () => {
        if (currentlySelectedVerticalLine !== null) {
            currentlySelectedVerticalLine.className = "vertical-line"
        }
        currentlySelectedVerticalLine = verticalLine
        currentlySelectedVerticalLine.className = "vertical-line vertical-line-focused"
    })
    textarea.addEventListener("blur", () => {
        verticalLine.className = "vertical-line"
        currentlySelectedVerticalLine = null
    })
    textarea.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.preventDefault()
            event.stopPropagation()
            textarea.blur()
            verticalLine.className = "vertical-line vertical-line-selected"
            currentlySelectedVerticalLine = verticalLine
        }
    })

    let editDiv = document.createElement("div")
    editDiv.className = "hcontainer stretch full-width section-edit"
    editDiv.appendChild(verticalLine)
    editDiv.appendChild(textarea)

    let deleteButton = document.createElement("button")
    deleteButton.className = "section-delete"
    deleteButton.innerText = "X"
    deleteButton.onclick = function (event) {
        event.preventDefault()
        event.stopPropagation()
        if (deleteButton.classList.contains("section-delete-clicked")) {
            let sections = document.getElementById("sections")
            sections.removeChild(section)
            saveState()
        } else {
            deleteButton.className = "section-delete section-delete-clicked"
        }
    }
    deleteButton.tabIndex = "-1"

    let section = document.createElement("div")
    section.className = "hcontainer stretch full-width section"
    section.appendChild(editDiv)
    section.appendChild(deleteButton)

    let sections = document.getElementById("sections")
    sections.appendChild(section)

    return section
}

function initialize() {
    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.key === "s") {
            event.preventDefault()
            event.stopPropagation()
            saveState()
        } else if (event.key === "Escape") {
            event.preventDefault()
            event.stopPropagation()
            if (currentlySelectedVerticalLine !== null) {
                currentlySelectedVerticalLine.className = "vertical-line"
            }
            currentlySelectedVerticalLine = null
        }
    })
    document.addEventListener("click", () => {
        Array.from(document.getElementsByClassName("section-delete-clicked")).forEach((section) => {
            section.className = "section-delete"
        })
    })

    const header = document.getElementById("header")
    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio < 1) {
                header.className = "hcontainer full-width header header-sticky"
            } else {
                header.className = "hcontainer full-width header"
            }
        }
        )
    }, { threshold: [1] })
    intersectionObserver.observe(header)

    loadState()
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
    window.addEventListener("resize", () => {
        let sections = document.getElementById("sections")
        Array.from(sections.getElementsByClassName("section-text")).forEach((sectionText) => {
            autoAdjustTextareaHeight(sectionText)
        })
    })

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/todo/service_worker.js").then((registration) => {
            registration.update()
        })
    }
}

window.onload = initialize
