function isObject(obj) {
    return typeof obj === 'object' && !Array.isArray(obj) && obj != null && obj != undefined
}
function observe (obj) {
    // Implement this!
    if (!isObject(obj)) throw new TypeError()

    Object.keys(obj).forEach((key) => {
        let internalValue = obj[key]
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            get() {
                dep.depend()
                return internalValue
            },
            set(newValue) {
                const isChanged = internalValue !== newValue
                if (isChanged) {
                    internalValue = newValue
                    dep.notify()
                }
            }
        })
    })
}

window.Dep = class Dep {
    constructor () {
        this.subscribers = new Set()
    }
    depend () {
        if (activeUpdate) {
            // register the current active update as a subscriber
            this.subscribers.add(activeUpdate)
        }
    }
    notify () {
        // run all subscriber functions
        this.subscribers.forEach(subscriber => subscriber())
    }
}

let activeUpdate

function autorun (update) {
    // 这个update中应该是渲染函数，自动运行，每次变量变化的时候，自动执行这个update渲染函数
    function wrappedUpdate () {
        activeUpdate = wrappedUpdate
        update()
        activeUpdate = null
    }
    wrappedUpdate()
}
