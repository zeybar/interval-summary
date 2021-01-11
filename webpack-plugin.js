class RemoveCommentPlugin {
  // new RemoveCommentPlugin会调用
  constructor(options) {
    this.options = options
  }

  // apply 函数中需要有通过 compiler 对象挂载的 webpack 事件钩子，钩子的回调中能拿到当前编译的 compilation 对象，如果是异步编译插件的话可以拿到回调 callback。
  apply(compiler) {
    // 去除注释正则
    const reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)|(\/\*\*\*\*\*\*\/)/g

    // 通过 compiler.hooks.emit.tap() 来触发生成文件后的钩子
    compiler.hooks.emit.tap('RemoveComment', (compilation) => {
      Object.keys(compilation.assets).forEach((item) => {
        // .source()是获取构建产物的文本
        let content = compilation.assets[item].source()

        content = content.replace(reg, (word) => {
        // 去除注释后的文本
        return /^\/{2,}/.test(word) || /^\/\*!/.test(word) || /^\/\*{3,}\//.test(word) ? '' : word
        })
        // 更新构建产物对象
        compilation.assets[item] = {
          source: () => content,
          size: () => content.length,
        }
      })
    })
  }
}