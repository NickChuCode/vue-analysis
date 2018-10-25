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
                    dep.notify(key)
                }
            }
        })
    })
}

Dep = class Dep {
    constructor () {
        this.subscribers = new Set()
    }
    depend () {
        this.subscribers.add(Dep.target)
    }
    notify (key) {
        // run all subscriber functions
        this.subscribers.forEach(subscriber => subscriber.update(key))
    }
}

class Watcher {
    constructor () {
        Dep.target = this
    }

    update(key) {
        console.log(`${key} has been changed to: ${state[key]}`)
    }
}

// 下面模拟vue初始化过程中给变量添加响应式特性的过程
// 假设state为我们需要具备响应式能力的数据(可以是vue中的props, data, watch, computed)
const state = {
    count: 0,
    test: 1
}

// 对state中的数据进行“响应式化”
observe(state)

// 添加一个观察者，在new的时候，会自动将其放入Dep.target中，在
new Watcher()

/* 在这里模拟render的过程，为了触发state下属性的get函数 */
console.log('render~', state.count);
console.log('render~', state.test);

state.count = 2
state.test++
