function saveList() {
    let to_do = document.getElementById("to-do")
    document.cookie = "to_do=" + to_do.value
}

function initialize() {
    let to_do = document.getElementById("to-do")
    let cookie = document.cookie.split(";")
    for (let i = 0; i < cookie.length; i++) {
        if (cookie[i].split("=")[0] == "to_do") {
            to_do.value = cookie[i].split("=")[1]
        }
    }
}
