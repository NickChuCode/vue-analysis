// a class representing a dependency
// exposing it on window is necessary for testing
window.Dep = class Dep {
    // Implement this!
    constructor() {
        this.subscribers = new Set()
    }

    depend() {
        // register the current active update as a subscriber
        if (activeUpdate) {
            this.subscribers.add(activeUpdate)
        }
    }

    notify() {
        // runs all subscriber functions
        this.subscribers.forEach((sub) => sub())
    }
}

let activeUpdate

function autorun (update) {
    // Implement this!
    function wrappedUpdate() {
        activeUpdate = wrappedUpdate
        update()
        activeUpdate = null
    }
    wrappedUpdate()
}
