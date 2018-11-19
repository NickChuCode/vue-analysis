// 做一个小型的 MVVM 库，可以做到数据和视图之间的自动同步。
//
// 你需要做的就是完成一个函数 bindViewToData，它接受一个 DOM 节点和一个对象 data 作为参数。
// bindViewToData 会分析这个 DOM 节点下的所有文本节点，并且分析其中被 {{ 和 }} 包裹起来的表达式，
// 然后把其中的内容替换成在 data 上下文执行该表达式的结果。例如：
//
// <div id='app'>
//   <p>
//     My name is {{firstName + ' ' + lastName}}, I am {{age}} years old.
//   </p>
// <div>
// const appData = {
//   firstName: 'Lucy',
//   lastName: 'Green',
//   age: 13
// }
// bindViewToData(document.getElementById('app'), appData)
//
// // div 里面的 p 元素的内容为
// // My name is Lucy Green, I am 13 years old.
//
// appData.firstName = 'Jerry'
// appData.age = 16
//
// // div 里面的 p 元素的内容自动变为
// // My name is Jerry Green, I am 16 years old.
// 当数据改变的时候，会自动地把相应的表达式的内容重新计算并且插入文本节点。

/**
 *1 利用Object.defineProperty监听数据
 *2 扫描节点，监听与数据关联的文本节点
 *3 数据变化更新节点
 **/
const observe = (data) => {
    if (!data || typeof data !== 'object') {
        return;
    }
    // 取出所有属性遍历，监听所有属性
    for(let key in data) {
        defineReactive(data, key, data[key]);
    }
};

//利用Object.defineProperty监听数据变化
//一个defineReactive对应对象一个属性
const defineReactive = (data, key, val) => {
    //一个dep管理一个对象的属性
    //对象属性跟节点是一对多的关系
    var dep = new Dep();
    Object.defineProperty(data, key, {
        get: function() {
            // 设置target，使得只有在new Watcher的时候才调用addNode
            if(target) {
                dep.addNode(target) // 把这个watcher加入到这个属性的依赖收集管理中
            }
            return val
        },
        set: function(newVal) {
            val = newVal;
            dep.notify();  // 通知依赖收集中所有的watcher，数据更新了
        }
    });
}

//Dep是对象属性对节点的依赖项watcher的管理器
function Dep() {
    this.nodes = []
}

Dep.prototype = {
    addNode: function(node) {
        this.nodes.push(node)
    },
    notify: function() {
        //异步更新节点（从性能角度考虑，因为要操作dom）
        setTimeout(() => {
            this.nodes.map((node) => {
                node.update()
            })
        })
    }
}

//观察者
function Watcher(data, node) {
    //target的作用是只在new Watcher的时候建立关系
    //不然每次get都将节点压入dep
    target = this;
    //保存节点，代理node节点中的数据和节点的值
    this.node = node;
    this.data = data;
    //保存text节点的值
    this.nodeValue = node.nodeValue;
    //将对象的每一个属性都访问一遍，建立对象属性跟节点的关系
    for(let key in data) {
        data[key]
    }
    target = null;
}

Watcher.prototype = {
    //模版解析
    execute: function(exp) {
        return new Function(...Object.keys(this.data), `return ${exp}`)(...Object.values(this.data))
    },
    //更新view
    update: function() {
        //匹配到{{}}
        const newValue = this.nodeValue.replace(/{{(.*?)}}/g, (exp) => {
            //去除{{,}}
            exp = exp.replace(/{{|}}/g, '')
            return this.execute(exp)
        })
        this.node.nodeValue = newValue;
    }
}

//监听所有text节点
const watchTextNode = (el, data) => {
    [...el.childNodes].forEach(child => {
        if(!(child instanceof Text)) {
            watchTextNode(child, data)
        }
        //这里监听了所有的text节点，应该做一层判断，只监听包含对象属性的文本节点（可优化）
        else new Watcher(data, child)
    })
}

const bindViewToData = (root, data) => {
    //监听数据
    observe(data);
    //数据变化则更新对应的节点
    watchTextNode(root, data);
    //先触发数据变化，更新view
    for(let key in data) {
        data[key] = data[key]
        return
    }
}