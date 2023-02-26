function saveList() {
    let todo = document.getElementById("todo")
    document.cookie = "todo=" + todo.value
}

function initialize() {
    let todo = document.getElementById("todo")
    let cookie = document.cookie.split(";")
    for (let i = 0; i < cookie.length; ++i) {
        if (cookie[i].split("=")[0] === "todo") {
            todo.value = cookie[i].split("=")[1]
        }
    }
}
