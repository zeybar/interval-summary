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

// vue lifecycle中 经典
// 可重置函数
let active = null;
function setActive(activeItem) {
    // 把老的先保存
    let preview = active;
    // 在更新新的
    active = activeItem

    return () => {
        // 重置老的
        active = preview;
    }
}
/*
使用
const restoreActive = setActive(aaa);
....
restoreActive();
*/

// 在vue中使用了大量的闭包
function watch() {
    //new Watch();

    return () => {
        // watch.teardown();
    }
}

// vue中的解析对象
// 就是一个长对象 {a: {b?: {c?: '11'}}}
export function resolveAsset (
    options: Object,
    type: string,
    id: string,
    warnMissing?: boolean
  ): any {
    /* istanbul ignore if */
    if (typeof id !== 'string') {
      return
    }
    const assets = options[type]
    // check local registration variations first
    if (hasOwn(assets, id)) return assets[id]
    const camelizedId = camelize(id)
    if (hasOwn(assets, camelizedId)) return assets[camelizedId]
    const PascalCaseId = capitalize(camelizedId)
    if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
    // fallback to prototype chain
    const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
    if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
      warn(
        'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
        options
      )
    }
    return res
  }

// 手动


// Vue中的EventEmitter
function Vue () {
  this._events = Object.create(null);
}

Vue.prototype.$on = function(event, fn) {
  if (Array.isArray(event)) {
    event.forEach(ev => {
      this.$on(ev, fn);
    });
  } else {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(fn);
  }

  return this;
}

Vue.prototype.$once = function(event, fn) {
  const vm = this;
  function on() {
    vm.$off(event, on);
    fn.apply(vm, arguments);
  }

  on.fn = fn;
  vm.$on(event, on);
  return this;
}

Vue.prototype.$off = function(event, fn) {
  // all
  if (!arguments.length) {
    this._events = Object.create(null)
  }

  if (!this._events[event]) return this;
  if (!fn) {
    this._events[event] = null;
    return this;
  }
  if (Array.isArray(event)) {
    event.forEach(ev => {
      this.$off(ev, fn);
    });
    return this;
  }

  const cbs = this._events[event];
  let i = cbs.length;

  while(i--) {
    // cb.fn 在once那里有定义
    if (cbs[i] === fn || cbs[i].fn === fn) {
      cbs.splice(i, 1);
      break;
    }
  }
  return this;
}

Vue.prototype.$emit = function(event) {
  let cbs = [...this._events[event]];
  const args = [...arguments].slice(1);
  cbs.forEach(cb => {
    cb.apply(this, args);
  });
}
  



// vue中的bind函数
function polyfillBind(fn, ctx) {
  function boundFn(a) {
    let len = arguments.length;

    if (len) {
      if (len > 1) {
        fn.apply(ctx, arguments)
      } else {
        fn.call(ctx, a);
      }
    } else {
      fn.call(ctx);
    }
  } 

  boundFn._length = fn.length;
  return boundFn;
}


// vue 中的-转小驼峰
function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : '';
  })
}