import ElButton from './src/button'

/* istanbul ignore next */
// 注册全局组件
ElButton.install = function(Vue) {
  Vue.component(ElButton.name, ElButton)
}

export default ElButton
