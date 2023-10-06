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
            const sectionText = section.getElementsByClassName("section-text")[0]
            const dragGrid = section.getElementsByClassName("drag-grid")[0]
            sectionText.value = todoList[i]
            console.log(dragGrid)
            autoAdjustTextareaHeight(sectionText, dragGrid)
        }
    } else {
        addSection()
    }
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

function updateDragGrid(dragGrid, rows) {
    const trs = Array.from(dragGrid.getElementsByTagName("tr"))
    if (trs.length > rows) {
        trs.slice(rows).forEach((tr) => {
            dragGrid.removeChild(tr)
        })
    } else {
        const columns = 2
        for (let i = 0; i < rows - trs.length; ++i) {
            const tr = BaseElements.tr()
            for (let j = 0; j < columns; ++j) {
                const td = BaseElements.td()
                td.appendChild(Elements.dragDot())
                tr.appendChild(td)
            }
            dragGrid.appendChild(tr)
        }
    }
    return dragGrid
}

function autoAdjustTextareaHeight(textarea, dragGrid) {
    textarea.style.height = "0px"
    const height = textarea.scrollHeight
    textarea.style.height = height + "px"
    const rows = Math.round(height / 23)
    const dragGridRows = 3 * rows
    updateDragGrid(dragGrid, dragGridRows)
}

const BaseElements = {
    element: function (tagName, className) {
        const element = document.createElement(tagName)
        if (arguments.length > 1) {
            element.className = className
        }
        return element
    },
    div: function () {
        return BaseElements.element("div", ...arguments)
    },
    table: function () {
        return BaseElements.element("table", ...arguments)
    },
    tr: function () {
        return BaseElements.element("tr", ...arguments)
    },
    td: function () {
        return BaseElements.element("td", ...arguments)
    },
    textarea: function () {
        return BaseElements.element("textarea", ...arguments)
    }
}

const Elements = {
    dragDot: function () {
        return BaseElements.div("drag-dot")
    },
    dragGrid: function () {
        const rows = 3
        const columns = 2
        const table = BaseElements.table("drag-grid")
        for (let i = 0; i < rows; ++i) {
            const tr = BaseElements.tr()
            for (let j = 0; j < columns; ++j) {
                const td = BaseElements.td()
                td.appendChild(Elements.dragDot())
                tr.appendChild(td)
            }
            table.appendChild(tr)
        }
        return table
    },
    sectionText: function () {
        const textarea = BaseElements.textarea("full-width section-text")
        textarea.autocomplete = "off"
        textarea.rows = "1"
        return textarea
    },
    editDiv: function () {
        const editDiv = BaseElements.div("hcontainer stretch full-width section-edit")
        const dragGrid = Elements.dragGrid()
        const sectionText = Elements.sectionText()
        sectionText.oninput = function () {
            autoAdjustTextareaHeight(sectionText, dragGrid)
            saveState()
        }
        editDiv.appendChild(dragGrid)
        editDiv.appendChild(sectionText)
        return editDiv
    }
}

function addSection() {
    const editDiv = Elements.editDiv()

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
            Array.from(document.getElementsByClassName("section-delete-clicked")).forEach((section) => {
                section.className = "section-delete"
            })
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
        }
    })
    document.addEventListener("click", () => {
        Array.from(document.getElementsByClassName("section-delete-clicked")).forEach((section) => {
            section.className = "section-delete"
        })
    })

    const preHeader = document.getElementById("pre-header")
    const header = document.getElementById("header")
    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                header.className = "hcontainer full-width header"
            } else {
                header.className = "hcontainer full-width header header-sticky"
            }
        }
        )
    }, { threshold: [1] })
    intersectionObserver.observe(preHeader)

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
        Array.from(sections.getElementsByClassName("section")).forEach((section) => {
            const sectionText = section.getElementsByClassName("section-text")[0]
            const dragGrid = section.getElementsByClassName("drag-grid")[0]
            autoAdjustTextareaHeight(sectionText, dragGrid)
        })
    })

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/todo/service_worker.js").then((registration) => {
            registration.update()
        })
    }
}

window.onload = initialize
