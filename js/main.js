function saveToDo() {
    let status = document.getElementById("status")
    status.innerText = "Saving..."
    let todo = document.getElementById("todo")
    let value = encodeURIComponent(todo.value)
    localStorage.setItem("todo", value)
    status.innerText = "Saved!"
}

function checkSingleInstance() {
    let currentInstanceId = parseInt(localStorage.getItem("currentInstanceId"))
    if (currentInstanceId !== window.currentInstanceId) {
        let todo = document.getElementById("todo")
        todo.disabled = true

        let status = document.getElementById("status")
        status.innerText = "Another instance of this app is running"
        status.className = "status right red"
    }
}

function initialize() {
    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.key === "s") {
            event.preventDefault()
            saveToDo()
        }
    })

    let todo = document.getElementById("todo")
    let value = localStorage.getItem("todo")
    if (value !== null) {
        todo.value = decodeURIComponent(value)
    }
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
}

window.onload = initialize
