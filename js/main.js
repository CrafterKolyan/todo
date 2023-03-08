function statusInfo(text) {
    let status = document.getElementById("status");
    status.className = "status right green";
    status.innerText = text;
}

function statusError(text) {
    let status = document.getElementById("status");
    status.className = "status right red";
    status.innerText = text;
}

function saveToDo() {
    statusInfo("Saving...");
    let todo = document.getElementById("todo");
    let value = encodeURIComponent(todo.value);
    localStorage.setItem("todo", value);
    statusInfo("Saved!");
}

function checkSingleInstance() {
    let currentInstanceId = parseInt(localStorage.getItem("currentInstanceId"));
    if (currentInstanceId !== window.currentInstanceId) {
        let todo = document.getElementById("todo");
        todo.disabled = true;

        statusError("Another instance of this app is running. Reload the page if you want to continue editing");
    }
}

function initialize() {
    "use strict";

    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.key === "s") {
            event.preventDefault();
            saveToDo();
        }
    });

    let todo = document.getElementById("todo");
    let value = localStorage.getItem("todo");
    if (value !== null) {
        todo.value = decodeURIComponent(value);
    }
    let currentInstanceId = localStorage.getItem("currentInstanceId");
    if (currentInstanceId === null) {
        currentInstanceId = 0;
    } else {
        currentInstanceId = parseInt(currentInstanceId) + 1;
    }
    localStorage.setItem("currentInstanceId", currentInstanceId);
    window.currentInstanceId = currentInstanceId;
    let status = document.getElementById("status");
    status.innerText = "Loaded!";

    window.checkSingleInstanceInterval = setInterval(checkSingleInstance, 1000);

    // Add offline support
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("js/offline_support.js")
            .then(function () {
                statusInfo("Now this application also works in offline");
            })
            .catch(function (err) {
                statusError("Couldn't add offline support to the application:" + err);
            });
    }
}

window.onload = initialize;
