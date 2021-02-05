// 手写promise函数
// promise函数特点，有三种状态 pedding / resolve / reject


// 自己封装一个比较精准的setInterval
function setInterval(callback, interval) {
    let timer;
    const now = Date.now;
    let startTime = now();
    let endTime = startTime;

    let loop = () => {
        timer = window.requestAnimationFrame(loop);
        endTime = now();
        if (endTime - startTime >= interval) {
            startTime = endTime = now();
            callback(timer);
        }
    }
    timer = window.requestAnimationFrame(loop);
    return timer;
}
/*
测试用例
let a = 0
setInterval(timer => {
  console.log(1)
  a++
  if (a === 3) cancelAnimationFrame(timer)
}, 1000, 2, 3)
*/


// 手写call函数
// context为需要重新指向this的对象
Function.prototype.call = function(context) {
    // 先判断是否为function, 因为只有function才会调call
    // 仅仅判断function的话只需要使用typeof即可 任何function
    if (typeof this !== 'function') {
        return;
    }
    // 如果没有传入则默认指向window
    context = context || window;
    // 剔除第一个参数，其余的作为参数，获取到所有参数
    const args = [...arguments].slice(1);
    // 把需要指向的函数先存起来
    context.fn = this;
    // 直接执行 并返回结果
    const res = context.fn(...args);
    delete context.fn;
    return res;
}

// 这个写法有个问题就是如果context是window，并且在window对象下已经定义了fn的值，这样fn就会被污染，可以改成
Function.prototype.call = function(context) {
    if (typeof this !== 'function') {
        return;
    }
    // 如果没有传入则默认指向window
    context = context || window;
    // 使用Symbol作为唯一的值
    const fn = Symbol();
    const args = [...arguments].slice(1);
    context[fn] = this;

    const res = context[fn](...args);
    delete context[fn];
    return res;
}

// 在这个基础上实现apply只要稍微变一下就行
Function.prototype.apply = function(context) {
    if (typeof this !== 'function') {
        return;
    }
    // 如果没有传入则默认指向window
    context = context || window;
    // 使用Symbol作为唯一的值
    const fn = Symbol();
    context[fn] = this;
    let res;
    if (arguments[1]) {
        res = context[fn](...arguments[1])
    } else {
        res = context[fn]();
    }
    delete context[fn];
    return res;
}

/*
bind的特点
1. 返回的是一个函数
2. 支持柯里化，可以先传部分函数再传其他函数
3. 一经绑定，永远无法改变this指向
4. bind后返回的函数，可以通过new去实例化
*/
Function.prototype.bind = function(context) {
    if (typeof this !== 'function') {
        return;
    }
    // 传入参数
    const args = [...arguments].slice(1);
    // 保存调用bind的函数
    const callMeFn = this;
    // 创建一个空函数, 是为了防止new的方式调用的时候通过__proto__原型属性修改熟悉而导致new出来的对象受到影响
    const fn = function() {}
    const bound = function() {
        // 合并参数，实现柯里化
        // 判断constructor是为了bind过的函数使用new的方式调用的时候的this指向，new方式调用需要this指向自身
        // 其他方式则只会绑定第一次绑定的对象
        fn.apply(this.constructor === callMeFn ? this : context, [...args, ...arguments])
    }
    // 这里把空白函数的prototype设置成使用bind的并实例化fn复制给bound的prototype
    // 
    fn.prototype = callMeFn.prototype;
    bound.prototype = new fn();
    return bound;
}

// 简单实现
Function.prototype.bind = function (context) {
    if (typeof this !== 'function') {
      throw new TypeError('Error')
    }
    const _this = this
    const args = [...arguments].slice(1)
    // 返回一个函数
    return function F() {
      // 因为返回了一个函数，我们可以 new F()，所以需要判断
      if (this instanceof F) {
        return new _this(...args, ...arguments)
      }
      return _this.apply(context, args.concat(...arguments))
    }
  }

  // 简单实现2
  Function.prototype.bind_ = function (obj) {
    //第0位是this，所以得从第一位开始裁剪
    var args = Array.prototype.slice.call(arguments, 1);
    var fn = this;
    return function () {
        //二次调用我们也抓取arguments对象
        var params = Array.prototype.slice.call(arguments);
        //注意concat的顺序
        fn.apply(obj, args.concat(params));
    };
};


// 实现一个instanceof

function myInstanceof(left, right) {
    const prototype = right.prototype;
    left = left.__proto__;
    while(true) {
        if (left === null || left === undefined) return false;
        if (left === prototype) return true;
        left = left.__proto__;
    }
}


// 函数柯里化



// 手写Object.create
// es5配置的不支持设置属性（第二个参数）
// 另外 const = {}  ==> 相当于 Object.create(Object.prototype)
Object.create = function(proto, prototypiesObject) {
    // 传入的值只能为对象
    if (typeof proto !== 'object' && typeof proto !== 'function') {
        return;
    }
    function F() {};
    F.prototype = proto;
    return new F();
}

// Object.create 如果传入对象并设置值，不设置
const o = Object.create(Object.prototype, {
    // foo会成为所创建对象的数据属性
    foo: { 
      writable:true,
      configurable:true,
      value: "hello" 
    },
    // bar会成为所创建对象的访问器属性
    bar: {
      configurable: false,
      get: function() { return 10 },
      set: function(value) {
        console.log("Setting `o.bar` to", value);
      }
    }
});

// 创建一个以另一个空对象为原型,且拥有一个属性p的对象
// 省略了的属性特性默认为false,所以属性p是不可写,不可枚举,不可配置的:
const o = Object.create({}, { p: { value: 42 } })


// 手写cache函数
function cache(fn) {
    // 创建一个对象来存cache
    const cache = Object.create(null);
    return function(str) {
        // 以返回函数的str作为key，保存cache的值，这样下次如果有一样的就不用重新计算了
        const hit = cache[str];
        return hit || (cache[hit] = fn(str));
    }
}


// vue中mergeAsset函数，很精妙
function mergeAssets(parent, child) {
    // 参考上面的Object.create的实现
    // 1. Object.create的内部新函数的Fn.prototype = parent;
    // 2. new的时候内部新函数返回值的{}.__proto__ = Fn.prototype; ==> {}.__proto__ = parent;
    // 3. 相当于res = {}
    // 4. res.__proto__ = parent;
    const res = Object.create(parent);

    // 这里只是直接赋值给新的对象
    for(let key in child) {
        res[key] = child[key];
    }

    return res;
}


// 手动实现一个observe函数
function observe(data) {
    if (!data || Object.prototype.toString.call(data) !== '[object Object]') {
        return;
    }
    Object.keys(data).forEach((key) =>  {
        const currentValue = data[key];
        if (typeof currentValue === 'object') {
            observe(data);
            data[key] = new Proxy(currentValue, {
                set(target, property, value, receiver) {
                    // 如果是数组，push方法会触发两次
                    console.log(`setting ${key} value now, setting value is`, currentValue)
                    return Reflect.set(target, property, value, receiver)
                }
            })
        } else {
            Object.defineProperty(data, key, {
                enumerable: true,
                configurable: false,
                get() {
                    console.log(`getting value is`, currentValue);
                    return currentValue;
                },
                set(newValue) {
                    console.log(`setting ${key} value now, setting value is`, currentValue)
                    currentValue = newValue;
                }
            })
        }
    })
}

function observe2(data) {
    if (!data || Object.prototype.toString.call(data) !== '[object Object]') {
        return;
    }
    Object.keys(data).forEach((key) =>  {
        const currentValue = data[key];debugger;
        if (typeof currentValue === 'object') {
            observe(currentValue);
            data[key] = new Proxy(currentValue, {
                set(target, property, value, receiver) {
                    // 如果是数组，push方法会触发两次
                    console.log(`setting ${key} value now, setting value is`, currentValue)
                    return Reflect.set(target, property, value, receiver)
                }
            })
        } else {
            Object.defineProperty(data, key, {
                enumerable: true,
                configurable: false,
                get() {
                    console.log(`getting value is`, currentValue);
                    return currentValue;
                },
                set(newValue) {
                    console.log(`setting ${key} value now, setting value is`, currentValue)
                    currentValue = newValue;
                }
            })
        }
    })
}


// 经典羊生羊问题
// 农场买了一只小羊，这种羊在第一年是小羊，第二年的年底会生一只小羊，第三年不生小羊，第四年的年底还会再生下一只小羊，第五年就死掉了。要计算N年时农场里有几只羊。
// 递归求解
// 第一年是sleep(1)只羊，所有初始值是1，第二年是sleep(2) 只，.... sleep(n) 总羊数就是 sleep(1) + ... sleep(n)
// sleep(n) = sleep(2) + sleep(4) + sleep(5)
// 所有的第几个，都是由别人算出来的，递归
// 所有第n年我不知道，但是我知道
function sleep(year) {
    // 第一年是一个有羊，所有初始值是1
    let num = 1;

    for(let i = 0; i < year; i++) {
        // 反正什么都不管，第二年的时候，那就计算第二年的值
        // 剩下多少年，一样使用递归去想，当前年不知道，但是第n - 2年可以由别人算出来，即调用自己来算
        if (i === 2) {
            num += sleep(year - 2);
        } else if (i === 4) {
            num += sleep(year - 4);
        } else if (i === 5) {
            num--;
        }
    }

    return num;
}


// 基础问题， ajax封装
function ajax(options) {
    return new Promise((resolve, reject) => {
        // 初始化参数
        const defaultOptions = {
            type: 'GET',
            dataType: 'json',
            data: {},
            timeout: 5000,
        }
        options = Object.assign({}, defaultOptions, options);
        const params = formatParams(options.data);

        const xhr = 'XMLHttpRequest' in window ? new XMLHttpRequest() : new ActiveXobject('Microsoft.XMLHTTP');

        const initMothods = {
            get() {
                xhr.open('GET', `${options.url}?${params}`, true);
                xhr.send(null);
            },
            post(){
                xhr.open('POST', options.url, true);
                // post需要设置content-type
                xhr.setRequestHeader('Content-type', options.contentType || 'application/x-www-form-urlencoded');
                xhr.send(params);
            }
        }

        initMothods[options.type.toLowerCase()] && initMothods[options.type.toLowerCase()]();

        // 设置超时时间
        setTimeout(() => {
            // readyState 4 表示 done,其他都是非完成
            if(xhr.readyState !== 4){
                xhr.abort();
                resolve();
            }
        }, options.timeout);

        // 监听接收函数
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                const status = xhr.status;
                if(status >= 200&& status < 300 || status == 304){
                    resolve(xhr.responseText,xhr.responseXML);
                  }else{
                    reject(status);
                  }
            }
        }
    });
}

//格式化请求参数, json => url
function formatParams(data){
    const arr=[];
    for(let name in data){
        arr.push(encodeURIComponent(name)+"="+encodeURIComponent(data[name]));
    }
    arr.push(("v="+Math.random()).replace(".",""));
    return arr.join("&");
}


// String.raw 意思
String.raw = function(strings, ...values) {
    let output = '';
    for (let i = 0; i < strings.raw[index]; i++) {
        output += strings.raw[index] + values[index]
    }

    output += strings.raw[values.length - 1]

    return output;
}


// 手动实现EventEmitter

class EventEmitter {
    constructor() {
        if (!this.events) this.events = Object.create(null);
    }

    getInstance() {
        if (!this.instance) {
            return new EventEmitter();
        }
        return this.instance;
    }

    on(eventName, cb) {
        (this.events[eventName] || (this.events[eventName] = [])).push(cb);
    }

    off(eventName) {
        if (!this.events[eventName]) this.events = Object.create(null);
        delete this.events[eventName];
    }

    once(eventName, cb) {
        const eventInstance = this;
        function on() {
            // 这里cb的this要不要绑定
            eventInstance.off(eventName, on);
            cb(...arguments);
        }
        // 只是为了存一份副本？
        on.fn = cb;
        this.on(eventName, on);
    }

    // 触发
    emit(eventName, ...rest) {
        const activeEvents = this.events.get(eventName);

        activeEvents.forEach((fn) => fn(...rest));
    }
}


// 手动实现jsonp
// 客户端定义回调函数 function jsonp
// 服务端返回函数的调用，获取到和后立即调用 后端返回 jsonp(args)
function autoJsonp() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.mock-api.com/?callback=jsonp';

    document.body.appendChild(script);

    function jsonp(res) {
        console.log(res)
    }
}

// 封装适配amd cmd头部写法
(function(global, factory) {
    // 判断cmd
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory()
    // 判断amd
    } else if (typeof define === 'function' && define.amd) {
        define(factory)
    }

})(this,  function () { 'use strict'; return 命名空间})


// 手动实现nextTick

let pending = false
// 存放需要调用的异步任务
const callbacks = []

function flushCallbacks() {
    pending = false

    for(let i = 0; i < callback.length; i++) {
        callbacks[i]()
    }

    callbacks.length = 0
}

function nextTick(cb) {
    callbacks.push(cb)

    if (!pending) {
        pending = true

        Promise.resolve().then(flushCallbacks)
    }
}

// 第一次调用 then方法已经被调用了 但是 flushCallbacks 还没执行
nextTick(() => console.log(1))
// callbacks里push这个函数
nextTick(() => console.log(2))
// callbacks里push这个函数
nextTick(() => console.log(3))
// 同步函数优先执行
console.log(4)

// 此时调用栈清空了，浏览器开始检查微任务队列，发现了 flushCallbacks 方法，执行。
// 此时 callbacks 里的 3 个函数被依次执行。

// 4
// 1
// 2
// 3


// 函数节流防抖
function debounce(fn, wait) {
    const timer = null
    // 没有立即执行
    return function() {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, [...arguments])
        }, wait)
    }
}
// 防抖立即执行
function debounce3(fn, wait, immediate) {
    const timer = null
    return function() {
        if (timer) clearTimeout(timer)
        if (immediate && !timer) {
            fn.apply(this, [...arguments])
        }
        timer = setTimeout(() => {
            fn.apply(this, [...arguments])
        }, wait)
    }
}

function debounce2(fn, wait) {
    const timer = null

    return function() {
        if (timer) clearTimeout(timer)
        let isImmidiate = !timer

        timer = setTimeout(() => {
            timer = null
        }, wait)

        if (isImmidiate) fn.apply(this, [...arguments])
    }
}

// 节流函数
function throttle(fn, wait) {
    const prev = 0;

    return function() {
        let now = Date.now()
        if (now - prev > wait) {
            prev = now
            fn.apply(this, [...arguments])
        }
    }
}
// 节流加强版
function throttle(fn, wait) {
    let prev = 0, timer = null
    return function() {
        let now = Date.now()
        // 判断上次触发的时间和本次触发的时间差是否小于时间间隔
        if (now - prev > wait) {
            // 如果小于，则为本次触发操作设立一个新的定时器
            // 定时器时间结束后执行函数 fn 
            if (timer) clearTimeout(timer)

            timer = setTimeout(() => {
                prev = now
                fn.apply(this, [...arguments])
            }, wait)
        } else {
            // 第一次执行
            // 或者时间间隔超出了设定的时间间隔，执行函数 fn
            prev = now
            fn.apply(this, [...arguments])
        }
    }
}


// 定义枚举常量
const PEDDING = 1
const FULFILLED = 2
const REJECTING = 3
// 手写Promise
class CustomPromise {


    // 传入executor作为参数 也就是 (resolve, reject) => {}
    constructor(executor) {
        this.status = PEDDING
        this.value = null
        this.error = null
        this.resolveCallback = [] // 用于存储多个then中的回调
        this.rejectCallbak = []

        // 定义resolve
        function resolve(val) {
            if (this.status === PEDDING) {
                this.status = FULFILLED
                this.val = val
                // resolve后改变状态并执行回调
                this.resolveCallback.forEach((fn) => fn(val))
            }
        }

        // 定义reject
        function reject(val) {
            if (this.status === PEDDING) {
                this.status = REJECTING
                this.error = val
                this.rejectCallbak.forEach((fn) => fn(val))
            }
        }

        try {
            executor(resolve, reject)
        } catch(e) {
            console.log(e)
        }
    }

    then(onResolve, onReject) {
        // 传入参数做好兼容
        onResolve = typeof onResolve === 'function' ? onResolve : v => v
        onReject = typeof onReject === 'function' ? onReject : e => { throw e }

        // padding的时候加入到数组中
        if (this.status === PEDDING) {
            return new CustomPromise((resolve, reject) => {
                this.resolveCallback.push(() => {
                    try {
                        resolvePromise(onResolve(this.val), resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                })
                this.rejectCallbak.push(() => {
                    try {
                        resolvePromise(onReject(this.error), resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                })
            })
        }
        // 为了保证异步，使用settimeout来模拟
        // 并且then后可以使用promise，需要返回新的promise实例
        if (this.status === FULFILLED) {
            return new CustomPromise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolvePromise(onResolve(this.val), resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }
        if (this.status === REJECTING) {
            return new CustomPromise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolvePromise(onReject(this.error), resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }
    }

    catch(onReject) {
        return this.then(null, onReject)
    }

    // 最后执行
    // finally 方法 , 不管 Promise 对象最后状态如何，都会执行的操作, 返回的依然是个Promise;
    // 参数 cb 没有接收之前 Promise 的值， 只是执行 cb 并继承之前的状态
    finally(callback) {
        return this.then(
            value => CustomPromise.resolve(callback()).then(() => value),
            reson => CustomPromise.reject(callback()).then(() => { throw reson })
        )
    }

    static resolve(value) {
        return value instanceof CustomPromise ? value : new CustomPromise((resolve) => resolve(value))
    }
    
    static reject(value) {
        return value instanceof CustomPromise ? value : new CustomPromise((resolve, reject) => reject(value))
    }

    static all(promises) {
        promises = Array.isArray(promises) ? promises : [promises]

        return new CustomPromise((resolve, reject) => {
            const length = promises.length
            let values = [], counter = 0

            promises.forEach((promise, index) => {
                // 如果不是promise实例则调用resolve方法
                if (!(pormise in CustomPromise)) {
                    promise = CustomPromise.resolve(promise)
                }

                promise.then((ret) => {
                    // 保证输出顺序是输入顺序
                    values[index] = ret
                    if (index === length) {
                        resolve(values)
                    }
                }, reject)
            })
        })
    }

    static race(promises) {
        promises = Array.isArray(promises) ? promises : [promises]

        return new CustomPromise((resolve, reject) => {
            promises.forEach((promise, index) => {
                // 如果不是promise实例则调用resolve方法
                if (!(pormise in CustomPromise)) {
                    promise = CustomPromise.resolve(promise)
                }
                // 直接执行第一个状态改变的
                promise.then(resolve, reject)
            })
        })
    }
}



function resolvePromise(retValue, resolve, reject) {
    // 如果传入的是promise实例
    if (retValue instanceof CustomPromise) {
        if (retValue.status === PEDDING) {
            // 如果是pedding把回调加入到callback中
            retValue.then(ret => {
                resolvePromise(ret, resolve, reject)
            }, error => {
                reject(error)
            })

        } else {
            retValue.then(resolve, reject)
        }
    } else {
        // 否则直接resolve
        resolve(retValue)
    }
}

// 使用promise实现控制并发数的，全部请求结束返回后回调
function hanldeFetchQueue(urls, max, callback) {
    const urlCount = urls.length
    const requestsQueue = []
    const results = []
    let i = 0
    const handleReuqest = (url) => {
        const req = fetch(url).then(res => {
            const len = results.push(res)
            if (len < urlCount && i + 1 < urlCount) {
                requestsQueue.shift()
                handleReuqest(urls[++i])
            } else if (len === urlCount) {
                callback()
            }
        }).catch(e => {
            results.push(e)
        })
        if (requestsQueue.push(req) < max) {
            handleReuqest(urls[++i])
        }
    }

    handleReuqest(urls[i])
}

// 实现方式2
function multiRequest(urls, maxNum) {
    const len = urls.length
    const result = new Array(len).fill(false)
    let count = 0

    return new Promise((resolve, reject) => {
        while(count < maxNum) {
            next()
        }

        function next() {
            let current = count++
            if(current >= len && result.every((item) => item !== false)) {
                resolve(result)
                return
            }
            const url = urls[current]
            fetch(url).then((res) => {
                result[current] = res
            }).catch(e => {
                result[current] = e
            }).finally(() => {
                if (current < len) {
                    next()
                }
            })


        }
    })
}

// 实现方式3
function mutiRequest(urls, maxNum, callback) {
    const fetchArr = []

    let i = 0

    function toFetch() {
        // 完成后
        if (i === urls.length) {
            return Promise.resolve()
        }
        // 那一个出来执行，执行后删除
        let active = urls[i++]
        fetchArr.push(active)
        active.then((res) => {
            fetchArr.splice(fetchArr.indexOf(active), 1)
        })

        // 当达到最大值就race比较，最先执行完的 再递归调用
        let p = Promise.resolve()
        if (fetchArr.length >= maxNum) {
            p = Promise.race(fetchArr)
        }
        return p.then(() => toFetch())
    }

    toFetch().then(() => Promise.all(urls)).then(() => {
        callback()
    })
}



// 实现简易版的双向数据绑定
/*
<div id="content">
name: {{name}}<br/>
<input type="text" v-model = 'name'>
</div>
*/
const el = document.querySelector('#content')
const template = el.innerHTML
const data = {
    name: 'abc'
}
let changeName = new Proxy(data, {
    set(target, name, value) {
        target[name] = value
        render()
    }
})
function render() {
    el.innerHTML = template.replace(/\{\{(\w+)\}\}/g,  ($0, $1) => data[$1])
    const input = document.querySelector('#content > input')
    let name = input.getAttribute('v-model')
    input.value = changeName[name]
    input.oninput = function(e) {
        changeName[name] = e.target.value
    }
}


// 深拷贝
function deepClone(obj) {
  let result = Object.create(null)

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      result = []
      for(let o of obj) {
        result.push(deepClone(o))
      }
    } else if (obj === null) {
      result = null
    } else {
      for(let key in obj) {
        result[key] = deepClone(obj[key])
      }
    }
  } else {
    result = obj
  }
  return result
}

// 深拷贝2
function deepClone2(obj, hash = new WeakMap()) {
    const isObject = typeof obj === 'object' && obj != null
    if (!isObject) return obj
    if (hash.has(obj)) return hash.get(obj)
    let target = Array.isArray(obj) ? [...obj] : {...obj}
    hash.set(obj.target)

    Reflect.ownKeys(obj).forEach(key => {
        let val = obj[key]
        if (typeof val === 'object' && val != null) {
            target[key] = deepClone2(val, hash)
        } else {
            target[key] = val
        }
    })
    return target
}

// 计算帧率
// 假设动画在时间 A 开始执行，在时间 B 结束，耗时 x ms。而中间 requestAnimationFrame 一共执行了 n 次，则此段动画的帧率大致为：n / (B - A)。
function caculateFps() {
    let frame = 0
    let allFrameCount = 0;
    let lastFrameTime, lastTime
    lastFrameTime = lastTime = Date.now()

    const loop = function() {
        let now = Date.now()
        let fs = (now - lastFrameTime)
        let fps = Math.round(1000 / fs)

        lastFrameTime = now

        allFrameCount++
        frame++

        if (now - lastTime > 1000) {
            let fps = Math.round((frame * 1000) / (now - lastTime))
            console.log(`1s内 FPS： `, fps)
            frame = 0
            lastTime = now
        }
    }

    requestAnimationFrame(loop)
}

// 计算fps
function calcFps(debounce = 1000){
    let lastTime = Date.now();
    let count = 0; // 记录decounce周期内渲染次数
    (function loop(){
        count++
        const now = Date.now()
        if( now - lastTime > debounce){
            const fps = Math.round(count / ((now - lastTime) / 1000))
            lastTime = now
            count = 0
            console.log('fps:', fps)
        }
        requestAnimationFrame(loop)
    })()
}


// 兼容amd cmd commonjs windows的写法
function(global, factory)(
    // amd
    if (typeof define !== 'undefined' && define.amd) {
        define(function() {
            return factory(global, global.document)
        })
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(global, global.document)
    } else {
        global.ClassName = factory(global, global.document)
    }
)(typeof window !== 'undefined' ? window : this, function(window, document) {
    'use strict'

    function ClassName {
        console.log('123')
    }
    return ClassName
})


// generator函数自动执行
function autoRun(gen) {
    const g = gen.next()
    function next(data) {
        const res = g.next(data)

        if (res.done) return
        res.value(next)
    }

    next()
}

// async函数本质
function fn(args) {
    return spawn(function *(){})
}

// generator自执行函数
function spawn(genFn) {
    return new Promise((resolve, reject) => {
        const gen = genFn()

        function step(nextFn){
            try {
                const next = nextFn()
            } catch(e) {
                reject(e)
            }

            if (next.done) return resolve(next.value)

            Promise.resolve(next.value).then(v => {
                step(() => gen.next(v))
            }, e => {
                step(() => gen.thow(e))
            })
        }
        step(() => gen.next(undefined))
    })
}


// 模块执行器  https://mp.weixin.qq.com/s/0sardJQmLiM-1Roff6sscg
// 白名单函数，允许使用什么
const ALLOW_LIST = ['console']
class Module {
    // 全局exports对象
    exports = {}
    wrapper = [
        'return (function(exports, modules) {',
        '\n});'
    ]

    wrap(script) {
        return `${this.wrapper[0]} ${script} ${this.wrapper[1]}`
    }

    runInContext(code) {
        code = `width (sandbox) {${code}}`
        const fn = new Function('sandbox', code)
        return (sandbox) => {
            const proxy = new Proxy(sandbox, {
                has(target, key) {
                    if (!ALLOW_LIST.includes(key)) { return true }
                },
                get(target, key, receiver) {
                    if (key === Symbol.unscopables) return undefined

                    Reflect.get(target, key, receiver)
                }
            })

            return fn(proxy)
        }
    }

    compile(content) {
        const wrapper = this.wrap(content)
        const compiledWrapper = this.runInContext(wrapper)({})
        compiledWrapper.call(this.exports, this.exports, this)
    }
}

// 测试执行
function getModuleFromString(code) {
    const scanModule = new Module()
    scanModule.compile(code)
    return scanModule.exports
}

const module = getModuleFromString(`
module.exports = { 
  name : 'ConardLi',
  action : function(){
    console.log(this.name);
  }
};
`);

module.action(); // ConardLi



// Iterator对象
function getIterator(list) {
    let i = 0;
    return {
        next: function() {
            const done = i >= list.length
            const value = done ? undefined : list[i++]

            return { done, value }
        },
        return() {
            return {
                done: true,
            }
        }
    }
}
