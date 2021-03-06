const effectStack = [] // 这里存储当前响应式数据的依赖函数
let targetMap = new WeakMap() // 存储所有reactive，所有key对应的依赖
// {
//   target1: {
//     key1: [effect](new Set([ effect回调函数 ]))
//   }
// }
// target1 其实就是使用响应式源对象作为 key，对象中的属性作为 key1 ，然后该属性对应着哪一些副作用函数整合到 [effect] 中


function track(target,key){
  // 收集依赖
  // reactive可能有多个，一个又有N个属性key
  const effect = effectStack[effectStack.length-1]
//   console.log('effect', effect, effectStack.length)
  if(effect){
    let depMap = targetMap.get(target)
    if(!depMap){
      depMap = new Map() // 类似对象类型，里面放着响应数据的属性 key 和对应 dep
      targetMap.set(target, depMap)
    }
    let dep = depMap.get(key)
    if(!dep){
      dep = new Set() // 这里使用了 Set 很重要，这里的 Set 能够防止重复保存依赖函数
      depMap.set(key,dep)
    }
    // 添加依赖
    dep.add(effect)
    effect.deps.push(dep)
    console.log('effectStark:', effectStack)
    // console.log('targetMap:', targetMap, effect.deps)
    // console.log('effect.deps:', effect.deps)
  }
}

function trigger(target,key,info){
  // 触发更新
  let depMap = targetMap.get(target)
  console.log('8888888888888', depMap)
  if(!depMap){
    return 
  }
  const effects = new Set()
  const computedRunners = new Set()
  if(key){
    let deps = depMap.get(key)
    deps.forEach(effect=>{
      if(effect.computed){
        computedRunners.add(effect)
      }else{
        effects.add(effect)
      }
    })
  }
  // 计算属性传入的 `fn` 会依赖 `reactive` 对象的属性 A
  // 所以这个 `fn` 也会在属性 A 依赖集合 `deps` 进行存储，属性 A
  // 发生了变化也会执行这个 `fn`
  computedRunners.forEach(computed=>computed())
  // 这里会执行一般的函数，这里就是主要就是执行：root.innerHTML 更新视图
  effects.forEach(effect=>effect())
}

function effect(fn,options={}){
    console.log('222222222222', options)
  // {lazy:false,computed:false}
  // 副作用
  // computed是一个特殊的effect
  let e = createReactiveEffect(fn,options)

  if(!options.lazy){
    // lazy决定是不是首次就执行effect
    e()
  }
  return e
}

const baseHandler = {
  get(target,key){
    const res = Reflect.get(target, key); // reflect更合理的
    console.log(res, key, '???')
    // 收集依赖
    track(target,key)
    // 当使用到内部属性的时候，再进行 Proxy 封装,
	if (typeof res === 'object') {
	  return reactive(res);
	}
    return res
  },
  set(target,key,val){
    const info = {oldValue:target[key], newValue:val}
    console.log('set: ', target, key, val)
    Reflect.set(target, key, val); // Reflect.set
    // 触发更新
    trigger(target,key,info)
  }
}
function reactive(target){
    console.log('111111111111111')
  if (typeof target === 'object') {
    /*
    if (target instanceof Array) {
      // 如果是一个数组，那么取出来数组中的每一个元素
      // 判断每一个元素是否又是一个对象，如果又是一个对象，那么也需要包装成 Proxy
	  target.forEach((item, index) => {
	    if (typeof item === 'object') {
          target[index] = reactive(item);
        }
      });
    } else {
	  // 如果是一个对象，那么取出对象属性的值
	  // 判断对象属性的值是否又是一个对象，如果又是一个对象，那么也需要包装成 Proxy
	  for (let key in target) {
	    const item = target[key];
		if (typeof item === 'object') {
		  target[key] = reactive(item);
		}
	  }
	}
	*/
    // target变成响应式
    const observerd = new Proxy(target, baseHandler);
    return observerd;
  } else {
	console.warn('请传入 Object');
	return target;
  }
}

function createReactiveEffect(fn,options){
    console.log('77777777777')
  const effect = function _effect(...args){
  /* 这里的 _effect 和 fn 都会因为在 run 函数中保存在 effectStack，
   * 然后执行 fn 触发数据的 get 方法，保存在 targetMap 对应响应式数据属性 key 的 dep 中，
   * 所以 _effect 和 fn 都会一直处于闭包状态，而不会消失，
   * 这时候，设置响应式数据的 set 方法时，就会触发执行 _effect 方法，
   * 并且重新执行 run 和里面的 fn，这时候 fn执行时，
   * 又会触发响应数据的 get 方法，触发收集依赖函数，
   * 此时就是因为收集依赖的是 new Set()，一所不会导致重复收集相同的依赖，流程就是这样了
   */
    return run(_effect,fn,args) 
  }
  // 为了后续清理 以及缓存
  effect.deps = []
  effect.computed = options.computed
  effect.lazy = options.lazy
  return effect
}
function run(effect,fn,args){
console.log('3333333', effectStack, effect.computed)
  if(effectStack.indexOf(effect)===-1){
    try{
      /**
       * 这里计算属性取值的时候，会调用计算属性的 fn 得到返回值，如果没有 if (!effect.computed) 这个条件，
       * 那么计算属性中所依赖的属性比如：age 就会绑定上 fn 这个依赖，而不是绑定上 root.innerHTML 这个依赖
       * 会导致更新 age 值，无法刷新视图，因为对于这种情况：
       * effect(()=>{
       *   root.innerHTML = `<h1>双倍${double.value}</h1>`
       * })
       * 没有取值 obj.age，只做了 double.value 的取值的话，就无法让计算属性中的 age 绑定正确的更新函数了
       * 当然 vue3 源码中也并不是这样做的，这里只是简单了一下，待更新中...
       */
      if (!effect.computed) effectStack.push(effect)
      console.log('44444444444', effectStack, fn)
      const x = fn(...args, 'hhh')
      console.log('--------', x)
      return x
    }finally{
    console.log('99999991', effectStack)
      effectStack.pop()
      console.log('99999992', effectStack)
    }
  }
}
function computed(fn){
    console.log('5555', fn)
  // 特殊的effect
  const runner = effect(fn, {computed:true,lazy:true})
  return{
    effect:runner,
    get value(){
        const r = runner()
        console.log('666666', r)
      return r // 这里计算属性取值的时候，会执行这个 runner 从而得到最新的值，这个值是依赖于计算属性传入的 fn 而来的
    }
  }
}
