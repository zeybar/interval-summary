/* @flow */

import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve: boolean = true

export function toggleObserving (value: boolean) {
  shouldObserve = value
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
// ovserve类， 传入value（具体的值） new Observer(value)
// 总结： observe(value) 就是把所有数据都劫持，如果是数组，循环劫持每个值，如果是对象，则递归循环把所有数据都劫持了
// 意味着每个数据都拥有自己的dep实例，自己的__ob__属性（值是当前dep实例）
// 所以vue实例的$set方法就是手动的去调用defineReactive方法，并调用notify通知watcher更新
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    // 在实例中初始化dep实例，dep实例提供addSub, removeSub，depend， notify方法
    this.dep = new Dep()
    this.vmCount = 0
    // 通过ObjectdefineProperty 把__ob__加入到当前实例中
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      if (hasProto) {
        // 如果是数组，并且__proto__ in {} 也就是普通数组，则要把重写的数组方法替换原来老的数组方法 value.__proto__ = arrayMethods;
        // 如果不存在__proto__ 就要通过ObjectdefineProperty 逐个设置
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // 并递归把子项也进行observe 也就是递归调用，使所有的值都拥有__ob__ 如果是数组则要有重写过的数组方法
      this.observeArray(value)
    } else {
      // 如果是对象则使用ObjectdefineProperty进行数据劫持
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
// 尝试为一个值创建一个观察者实例，如果观察成功，返回新的观察者，如果值已经有一个观察者，则返回现有的观察者。
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 这里是因为有设置过__ob__.prototype.constructor = Observer;
  // shouldObserve为全局变量，通过只有通过全局函数toggleObserving设置，具体有什么用后面补充 // todo
  //TODO
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
// 双向绑定，对象劫持，主要传入obj,key,val
// customSetter 什么用？
// shallow 什么用？
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 创建一个依赖收集实例，dep
  const dep = new Dep()

  // 如果该熟悉的configurable为false则为不可配置，那就处理不了
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 这里先保存getter 和setter,另外如果不传value，也可以通过key取,所以加个判断
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  // observe 在本文件中，主要是为该值创建一个观察者实例Observe实例，在该属性下面增加__ob__
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      // 访问到该属性的的target,即使用该属性的watcher为当前target
      // target由targetStack一个栈结构管理，target随时会变化，通过pushTarget设置target
      // 而pushTarget 会在new Watcher的时候被调用，所以新的wathcer实例被添加进dep实例中的数组里
      if (Dep.target) {
        // target是一个wacher实例，应该是使用该属性的渲染watcher
        // 这里depend实际是调用 Dep.target.addDep(this) ，也就是把当前dep实例存入watcher内部的xx中
        // get -> 调用dep.depend -> 实际是调用当前使用该属性的wacher实例的addDep方法，即watcher.addDep(当前dep实例) 
        // -> 在addDep中如果该dep没有存在watcher的depIds中时，就在内部（内部有dep实例的引用）-> dep.addSub(当前wacher实例) -> 这样当前dep实例就有了使用该属性的watcher实例
        dep.depend()
        if (childOb) {
          // 如果属性有子属性，则继续把子属性的dep存入watcher内部中
          //如果子属性为数组，则要则要递归调用depend，一样把子项的dep加入到watcher中
          childOb.dep.depend()
          if (Array.isArray(value)) {
            // 调用value[i]__ob__.dep.depend();
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      // 如果有setter， 则直接调用，传入新改变的值，否则直接赋值给val (define传入的val，可传可不传)
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // 重新初始化子项的Observer实例
      childOb = !shallow && observe(newVal)
      // 通知更新 调用subs[i].update()，调用watcher的update，通知wacherupdate
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
