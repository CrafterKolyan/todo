# [ToDo](https://crafterkolyan.github.io/todo/)

Static web application for ToDo

Website: [https://crafterkolyan.github.io/todo/](https://crafterkolyan.github.io/todo/)

## Features
- Save (Autosave/Ctrl + S)
    - Your ToDo is saved purely on your computer via [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) (preserved between browser sessions)
    - ToDo is saved on any change
    - `Ctrl + S` saves content (This feature is needed purely to keep users sane)
- Detection of 2 instances running at the same time
    - Check each second if another instance of application
    - Automatically restricts edits to todo field and alerts user about another instance running

## Tested in browsers
- Chrome
- Microsoft Edge
- Android Chrome
