function saveToDo() {
    let status = document.getElementById("status")
    status.innerText = "Saving..."
    let todo = document.getElementById("todo")
    let value = encodeURIComponent(todo.value)
    localStorage.setItem("todo", value)
    status.innerText = "Saved!"
}

function initialize() {
    let todo = document.getElementById("todo")
    todo.value = decodeURIComponent(localStorage.getItem("todo"))
}

window.onload = initialize
