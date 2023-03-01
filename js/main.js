function saveToDo() {
    let status = document.getElementById("status")
    status.innerText = "Saving..."
    let todo = document.getElementById("todo")
    let value = encodeURIComponent(todo.value)
    localStorage.setItem("todo", value)
    status.innerText = "Saved!"
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
    let status = document.getElementById("status")
    status.innerText = "Loaded!"
}

window.onload = initialize
