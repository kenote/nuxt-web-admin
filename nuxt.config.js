// nuxt.config.js
import tsconfigPathsWebpackPlugin from 'tsconfig-paths-webpack-plugin'
import config from './client/config'

export default {
  env: {},
  srcDir: 'client',
  mode: 'universal',
  ignoreOptions: {
    ignorecase: false
  },
  head: {
    title: config.name,
    meta: [ 
      ...config.meta 
    ]
  },
  css: [
    '~/assets/iconfont/iconfont.css',
    '~/assets/scss/common.scss'
  ],
  plugins: [
    '~/plugins/composition-api',
    '~/plugins/component',
    { src: '~/plugins/element-ui', ssr: true }
  ],
  loading: {
    color: '#00c58e', 
    height: '2px'
  },
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxt/components',
    '@nuxtjs/svg'
  ],
  components: [
    '~/components',
    { path: '~/components/passport', prefix: 'passport' },
    { path: '~/components/dashboard', prefix: 'dashboard' }
  ],
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
    extend (config, ctx) {
      config.resolve.plugins = [
        new tsconfigPathsWebpackPlugin()
      ]
    }
  },
  router: {
    extendRoutes (routes, resolve) {
      routes.push({
        name: 'custom',
        path: '*',
        component: resolve(__dirname, 'client/components/error-page.vue')
      })
    }
  }
}