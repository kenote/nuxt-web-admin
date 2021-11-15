<template>
  <fragment>
    <div class="detail-fixed">
      <el-button-group>
        <el-button plain size="small" @click="command('action:list')">返 回</el-button>
        <el-button :disabled="!pervItem" plain size="small" @click="requestData(pervItem)">上一条</el-button>
        <el-button :disabled="!nextItem" plain size="small" @click="requestData(nextItem)">下一条</el-button>
      </el-button-group>
    </div>
    
    <template v-if="item">
      <div class="detail-head">
        <h3>{{title}}</h3>
        <span class="date">{{date}}</span>
        <el-divider></el-divider>
      </div>
      <div v-if="type === 'markdown'" class="detail-body" v-loading="loading">
        <web-markdown v-if="!loading"
          :style="{ maxWidth: '800px' }"
          :content="content"
          :disabled-click="true"
          />
      </div>
    </template>
    <el-empty v-else-if="initial" style="margin-top:80px">
      <div slot="description">
        <h3>404 Not Found</h3>
        <p>未找到该条信息，可能在服务端已经删除！</p>
      </div>
    </el-empty>
  </fragment>
</template>

<script lang="ts">
import { Component, mixins, Prop, Emit, Provide, Watch } from 'nuxt-property-decorator'
import EnvironmentMixin from '~/mixins/environment'
import { Channel } from '@/types/client'
import { cloneDeep, get } from 'lodash'
import { parseProps, customize, parseTemplate } from '@/utils'
import { Route } from 'vue-router'

@Component<Webdetail>({
  name: 'web-detail',
  created () {
    this.requestData()
  },
  mounted () {
    
  }
})
export default class Webdetail extends mixins(EnvironmentMixin) {
  
  @Prop({ default: undefined })
  request!: Channel.RequestConfig

  @Prop({ default: 'markdown' })
  type!: 'markdown' | 'html'

  @Prop({ default: undefined })
  props!: Record<string, any>

  @Prop({ default: 'YYYY-MM-DD' })
  dateFormat!: string

  @Prop({ default: undefined })
  afterCommand!: string[]

  @Provide()
  title: string = ''

  @Provide()
  date: string = ''

  @Provide()
  content: string = ''

  @Provide()
  loading: boolean = false

  @Provide()
  initial: boolean = false

  @Provide()
  item: Record<string, any> | null = null

  @Provide()
  pervItem: Record<string, any> | null = null

  @Provide()
  nextItem: Record<string, any> | null = null

  @Watch('$route')
  onRouteChange (val: Route, oldVal: Route) {
    if (val === oldVal) return
    if (val.query.detail && get(this.item, '_id') !== val.query.detail) {
      this.requestData({ _id: val.query.detail })
    }
  }

  @Emit('get-data')
  getData (request: Channel.RequestConfig, options: any, next: (data: any) => void) {}

  @Emit('command')
  command (type: string, row: Record<string, any>) {}

  requestData (selected: Record<string, any> | null = null) {
    if (this.request) {
      let request = cloneDeep(this.request)
      if (selected) {
        request.url = parseTemplate(request.url ?? '', { selected })
      }
      this.loading = true
      let options = { afterCommand: this.afterCommand }
      if (!this.env.selected && !selected) {
        let { detail } = this.$route.query
        selected = { _id: detail }
        request.url = parseTemplate(request.url ?? '', { selected })
      }
      this.getData(request, options, data => {
        let propsData = parseProps(this.props)(data)
        this.title = get(propsData, 'title', '')
        this.date = customize.dateFormat(get(propsData, 'date', ''), this.dateFormat)
        this.content = parseTemplate(get(propsData, 'content', ''), this.env)
        this.item = get(propsData, 'item')
        this.pervItem = get(propsData, 'pervItem')
        this.nextItem = get(propsData, 'nextItem')
        this.loading = false
        let mainScroll = this.$root.$el.querySelector('.page-main .ps') as HTMLElement
        mainScroll.scrollTop = 0
        let { path,  } = this.env.$route
        this.$router.push({ path, query: { detail: (selected ?? this.env.selected)?._id } })
        if (!this.initial) {
          this.initial = true
        }
      })
    }
  }

}
</script>

<style lang="scss" scoped>
.detail-fixed {
  position: fixed;
  // top: 120px;
  bottom: 10px;
  z-index: 4;

  .el-button {
    border-radius: 0 !important;
  }
}

.detail-head {
  text-align: center;
  margin-top: 50px;

  h3 {
    max-width: 800px;
    margin: auto;
  }

  .date {
    color: #999;
    display: block;
    margin-top: 15px;
  }

  .el-divider--horizontal {
    max-width: 800px;
    margin: 24px auto;
  }
}

.detail-body {
  height: inherit;
  padding: 0 15px;
  margin-top: 50px;
}
</style>