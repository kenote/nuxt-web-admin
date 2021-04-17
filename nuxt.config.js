// Nuxt Configure
const path = require('path')

module.exports = {
  /**
   * Nuxt 2.13.0 后会收集有关常规用法的匿名遥测数据
   * 在开发环境下每次启动都会有提示，telemetry 选项可以让我们关闭它
   */
  telemetry: false,
  /**
   * 设定环境变量
   */
  env: {},
  /**
   * 设定客户端源码目录
   */
  srcDir: 'client',
  /**
   * 忽略选项 
   */
  ignoreOptions: {
    ignorecase: false
  },
  /**
   * 加载 Style 样式
   */
  css: [

    // lib css
    'codemirror/lib/codemirror.css',
    // merge css
    'codemirror/addon/merge/merge.css',
    // theme css
    'codemirror/theme/paraiso-light.css',
    '~/assets/iconfont/iconfont.css',
    '~/assets/scss/common.scss'
  ],
  /**
   * 加载插件
   */
  plugins: [
    '~/plugins/component',
    '~/plugins/http-client',
    { src: '~/plugins/element-ui', ssr: true },
    { src: '~/plugins/codemirror', ssr: false }
  ],
  /**
   * 页面 Loading 条设置
   */
  loading: {
    color: '#00c58e', 
    height: '2px'
  },
  /**
   * 加载编译模块
   */
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxt/components'
  ],
  /**
   * 配置组件
   */
  components: [
    '~/components',
    { path: '~/components/account', prefix: 'account' }
  ],
  /**
   * 编译配置
   */
  build: {
    babel: {
      plugins: [
        ['component', {
          libraryName: 'element-ui',
          styleLibraryName: 'theme-chalk'
        }]
      ],
      comments: true
    },
  },
  /**
   * 映射路径
   */
  alias: {
    '@': path.resolve(__dirname)
  },
  /**
   * 路由配置
   */
  router: {
    extendRoutes (routes, resolve) {
      routes.push({
        path: '/',
        component: resolve(__dirname, 'client/pages/home.vue')
      })
    }
  }
}