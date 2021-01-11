import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
// 定义_init方法
initMixin(Vue)
// 定义$set $del $watch方法
stateMixin(Vue)
// 定义订阅发布的几个函数 $on $off $once $emit
eventsMixin(Vue)
// 定义全局生命周期几个函数 $update $forceUpdate $destroy
lifecycleMixin(Vue)
// 定义_render函数， nextTick函数
renderMixin(Vue)

/*
这里就是相当于
import Vue from 'vue';
的时候定义了全局Vue的所有全局方法

在new Vue()
的时候调用_init方法，init方法内部再去初始化数据
*/
export default Vue
