"use strict";

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
        return {
            version: "1",
            todo: [""]
        }
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

function lowerbound(array, value) {
    let left = 0
    let right = array.length
    while (left < right) {
        let mid = Math.floor((left + right) / 2)
        if (array[mid] < value) {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left
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

const textareaRowHeight = 23

function autoAdjustTextareaHeight(textarea, dragGrid) {
    textarea.style.height = "0px"
    const height = textarea.scrollHeight
    textarea.style.height = height + "px"
    const rows = Math.round(height / textareaRowHeight)
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
    },
    button: function () {
        return BaseElements.element("button", ...arguments)
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
        table.draggable = true
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
        textarea.style.height = textareaRowHeight + "px"
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
    },
    deleteButton: function () {
        const deleteButton = BaseElements.button("section-delete")
        deleteButton.innerText = "X"
        deleteButton.tabIndex = "-1"
        return deleteButton
    },
    section: function () {
        const section = BaseElements.div("hcontainer stretch full-width section")
        const editDiv = Elements.editDiv()
        const deleteButton = Elements.deleteButton()
        deleteButton.onclick = function (event) {
            event.preventDefault()
            event.stopPropagation()
            if (deleteButton.classList.contains("section-delete-clicked")) {
                const sections = document.getElementById("sections")
                sections.removeChild(section)
                saveState()
            } else {
                Array.from(document.getElementsByClassName("section-delete-clicked")).forEach((deleteButton) => {
                    deleteButton.classList.remove("section-delete-clicked")
                })
                deleteButton.classList.add("section-delete-clicked")
            }
        }
        const dragGrid = editDiv.getElementsByClassName("drag-grid")[0]
        let offsets = null
        function onDragEnd(pageY) {
            const sectionsElement = document.getElementById("sections")
            const sections = Array.from(sectionsElement.querySelectorAll(".section:not(.section-drag)"))
            const sectionOffsets = sections.map((section) => section.offsetTop + section.offsetHeight / 2)
            const newIndex = lowerbound(sectionOffsets, pageY)
            if (sections[newIndex] !== section) {
                // Not needed for some reason
                // sectionsElement.removeChild(section)
                if (newIndex === sections.length) {
                    sectionsElement.appendChild(section)
                } else {
                    sectionsElement.insertBefore(section, sections[newIndex])
                }
                saveState()
            }
            section.classList.remove("section-drag")
            section.removeAttribute("style")
            offsets = null
        }
        dragGrid.addEventListener("mousedown", (event) => {
            section.classList.add("section-drag")
            offsets = [section.offsetLeft - event.pageX, section.offsetTop - event.pageY]
        })
        dragGrid.addEventListener("mouseup", () => {
            section.classList.remove("section-drag")
            offsets = null
        })
        dragGrid.addEventListener("dragstart", (event) => {
            event.dataTransfer.setDragImage(event.target, window.outerWidth, window.outerHeight)
        })
        dragGrid.addEventListener("drag", (event) => {
            if (event.screenX === 0 && event.screenY === 0) {
                return
            }
            section.style.position = "absolute"
            section.style.left = offsets[0] + event.pageX + "px"
            section.style.top = offsets[1] + event.pageY + "px"
        })
        dragGrid.addEventListener("dragend", (event) => {
            onDragEnd(event.pageY)
        })
        dragGrid.addEventListener("touchstart", (event) => {
            section.classList.add("section-drag")
            offsets = [section.offsetLeft - event.changedTouches[0].pageX, section.offsetTop - event.changedTouches[0].pageY]
        })
        dragGrid.addEventListener("touchmove", (event) => {
            event.preventDefault()
            section.style.position = "absolute"
            section.style.left = offsets[0] + event.changedTouches[0].pageX + "px"
            section.style.top = offsets[1] + event.changedTouches[0].pageY + "px"
        })
        dragGrid.addEventListener("touchend", (event) => {
            onDragEnd(event.changedTouches[0].pageY)
        })
        section.appendChild(editDiv)
        section.appendChild(deleteButton)
        return section
    }
}

function addSection() {
    const section = Elements.section()
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
    const intersectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    header.classList.remove("header-sticky")
                } else {
                    header.classList.add("header-sticky")
                }
            })
        },
        { threshold: [1] }
    )
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
