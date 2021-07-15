<template>
  <dashboard v-loading="initinal || refresh">
    
    <!-- 创建视图容器 -->
    <template v-for="component in components">
      <web-component v-if="isFilter(component.conditions)"
        :key="component.key"
        :type="component.name"
        v-model="component.value"
        :options="getComponentOptions(component)"
        :http-options="httpOptions"
        :editor-config="editorConfig"
        @get-data="handleGetData"
        @upload-file="uploadFile"
        @submit="handleSubmit"
        @command="handleCommand"
        @to-page="toPage"
        @selection-change="selectionChange"
        :unique="handleUnique"
        :loading="loading"
        :data="data"
        :pageno="pageno"
        :counts="counts"
        :pagination="pagination"
        :times="times"
        :env="env"
        />
    </template>
    <!-- 创建工具按钮 -->
    <fragment slot="tools">
      <template v-for="tool in tools">
        <el-tooltip :key="tool.key" :content="tool.name" placement="left-start">
          <el-button type="info" :icon="tool.icon" circle @click="handleCommand(tool.command)"></el-button>
        </el-tooltip>
      </template>
      
    </fragment>
    <!-- 创建抽屉式工具 -->
    <web-drawer :placement="drawerOptions.placement" :width="drawerOptions.width" :visible="drawerOptions.key" @close="handleCloseDrawer">
      <div class="container" ref="drawerContauner">
        <div class="drawer__header">
          <span>{{drawerOptions.name}}</span>
        </div>
        <perfect-scrollbar :options="{ suppressScrollX: true }">
          <div class="drawer__bodyer">
            <web-form-item
              :value="configuration"
              type="codemirror"
              width="auto"
              :height="drawerContaunerHeight - 100"
              :options="{
                theme: 'monokai',
                contentType: 'text/x-yaml',
                lineNumbers: true,
                tabSize: 2,
                isCopy: true,
                readOnly: true
              }"
              />
          </div>
        </perfect-scrollbar>
      </div>
    </web-drawer>
  </dashboard>
</template>

<script lang="ts">
import { Component, mixins, Provide, Watch, Vue } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Channel, HttpResult, HttpClientOptions } from '@/types/client'
import { isString, merge, get, set, cloneDeep, assign, omit, intersection, isEmpty } from 'lodash'
import { isYaml, parseParams, runCommand, getFilter, parseTemplate } from '@/utils'
import jsYaml from 'js-yaml'
import { PutResult } from '@kenote/upload'
import { UserDocument } from '@/types/services/db'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'

interface DrawerOptions {
  key         : string
  name       ?: string
  placement  ?: 'top' | 'bottom' | 'left' | 'right'
  width      ?: number
}

@Component<AutoPage>({
  name: 'auto-page',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
  created () {
    this.env = {
      auth: this.auth,
      selected: this.selected,
      selection: this.selection
    }
  },
  mounted () {
    
  }
})
export default class AutoPage extends mixins(PageMixin) {

  @Provide()
  tools: Channel.Tool[] = []

  @Provide()
  components: Channel.Component[] = []

  @Provide()
  drawerType: string = ''

  @Provide()
  drawerOptions: DrawerOptions = { key: '' }

  @Provide()
  drawerContaunerHeight: number = 0

  @Provide()
  configuration: string = ''

  @Provide()
  uniqueOptions: Channel.RequestConfig = {}

  @Provide()
  data: Record<string, any>[] | null = null

  @Provide()
  pageno: number = 1

  @Provide()
  counts: number = 0

  @Provide()
  pagination: number | false = false

  @Provide()
  conditions: Record<string, any> = {}

  @Provide()
  selected: Record<string, any> | null = null

  @Provide()
  selection: Record<string, any>[] = []

  @Provide()
  parent: Vue | null = null

  @Provide()
  actionOptions: Record<string, Channel.ActionOptions> = {}

  @Watch('refresh')
  onrefreshChange (val: boolean, oldVal: boolean) {
    if (val === oldVal) return
    if (val) {
      this.components = []
      setTimeout(async () => {
        await this.initinalPage(this.pageSetting)
        this.completeRefresh()
      }, 800)
    }
  }

  @Watch('pageSetting')
  async onPageSetting (val: Partial<Channel.DataNode>, oldVal: Partial<Channel.DataNode>) {
    if (val === oldVal) return
    await this.initinalPage(val)
  }

  @Watch('drawerOptions')
  onDrawerOptions (val: DrawerOptions, oldVal: DrawerOptions) {
    if (val === oldVal) return
    if (val.key) {
      let drawerContauner = this.$refs['drawerContauner'] as HTMLDivElement
      if (drawerContauner) {
        this.drawerContaunerHeight = drawerContauner.clientHeight
      }
    }
  }

  @Watch('auth')
  onAuthChange (val: UserDocument, oldVal: UserDocument) {
    if (val === oldVal) return
    this.env.auth = val
  }

  @Watch('selected')
  onSelectedChange (val: Record<string, any>, oldVal: Record<string, any>) {
    if (val === oldVal) return
    this.env.selected = val
  }

  @Watch('selection')
  onSelectionChange (val: Record<string, any>[], oldVal: Record<string, any>[]) {
    if (val === oldVal) return
    this.env.selection = val
  }

  getComponentOptions (component: Channel.Component) {
    return merge(component.options, { 
      options: { avatar: this.avatarOptions },
      // defaultValues: parseParams(component.options.defaultValues || '')(this.env)
    })
  }
  
  /**
   * 初始化页面
   */
  async initinalPage (options: Partial<Channel.DataNode>) {
    let { configuration } = options
    if (!configuration) return
    if (isString(configuration)) {
      try {
        let result = await this.$httpClient().GET(configuration)
        if (!isString(result) && !isYaml(result)) return
        let { tools, components, uniqueOptions, env, actions, initialData, pageSize } = jsYaml.load(result) as Channel.Configuration
        this.tools = tools ?? []
        this.configuration = result
        this.components = components ?? []
        this.uniqueOptions = uniqueOptions ?? {}
        this.env = merge(this.env, env)
        this.actionOptions = actions ?? {}
        if (pageSize) {
          this.pagination = pageSize
        }
        if (initialData) {
          setTimeout(() => {
            this.handleSubmit(this.conditions, initialData?.request!, initialData?.submitOptions ?? {})
          }, 500)
          
        }
      } catch (error) {
        
      }
    }
    else {
      let { tools, components, uniqueOptions, env, actions } = configuration as Channel.Configuration
      this.tools = tools ?? []
      this.configuration = jsYaml.dump(configuration)
      this.components = components ?? []
      this.uniqueOptions = uniqueOptions ?? {}
      this.env = merge(this.env, env)
      this.actionOptions = actions ?? {}
    }
  }

  /**
   * 获取单项数据
   */
  handleGetData (request: Channel.RequestConfig, options: Record<string, any> | null, next: (data: Channel.FormItemData[]) => void) {
    let { method, url, conditions, params, saveEnvkey } = request
    let httpClient = this.$httpClient(this.httpOptions)
    if (request.loading) {
      this.loading = true
    }
    let Iurl = parseTemplate(url ?? '', this.env)
    let IParams = parseParams(params ?? {})(this.env)
    // console.log(IParams)
    setTimeout(async () => {
      let result = await httpClient[method!](Iurl, IParams) as HttpResult<any[]>
      let filter = getFilter(conditions!, this.env)
      let data = result.data?.filter(filter!) ?? []
      if (saveEnvkey) {
        set(this.env, saveEnvkey, cloneDeep(data))
      }
      next(data)
      if (request.loading) {
        this.loading = false
      }
    }, 500)
    
  }

  /**
   * 跳转页号
   */
  toPage (page: number) {
    this.pageno = page
    let action = get(this.actionOptions, 'refresh')
    if (action) {
      let { request, confirm, method, submitOptions } = action as Channel.ActionOptions
      this.handleSubmit(merge(this.conditions, { page }), request!, submitOptions ?? {})
    }
  }

  /**
   * 监听多选条目
   */
  selectionChange (selection: Record<string, any>[]) {
    this.selection = selection
  }

  /**
   * 提交数据
   */
  handleSubmit (values: Record<string, any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {
    let { method, url, headers, params } = action ?? {}
    let { success, commit, afterCommand, assignment, pagination, failCommand } = options
    if (!action) {
      if (afterCommand) {
        for (let item of afterCommand) {
          this.handleCommand(item, {}, this.parent ?? undefined)
        }
      }
      return
    }
    let httpOptions: HttpClientOptions = merge(this.httpOptions, { headers })
    let Iurl = parseTemplate(url ?? '', this.env)
    if (pagination === 'remote') {
      this.pageno = values.page ?? 1
      values = merge({ page: this.pageno, size: this.pagination }, values)
    }
    else if (params) {
      values = parseParams(params)({ ...this.env, values })
    }
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient(httpOptions)[method ?? 'POST'](Iurl, values) as HttpResult<any>
        if (options.step) {
          this.sendWait(options.step)
        }
        if (result.error) {
          this.$message.error(result.error)
        }
        else {
          if (assignment) {
            this.conditions = omit(values, ['page', 'size'])
            set(this.env, 'conditions', omit(values, ['page', 'size']))
            for (let [key, val] of Object.entries(assignment)) {
              set(this, key as string, get(result, val))
            }
          }
          if (commit) {
            let commitType = get(this.types, commit)
            commitType && this.$store.commit(commitType, result.data)
          }
          this.$message.success(success ?? '信息已更新')
          if (afterCommand) {
            for (let item of afterCommand) {
              this.handleCommand(item, {}, this.parent ?? undefined)
            }
          }
          options.next && options.next(values)
        }
      } catch (error) {
        this.$message.error(error.message)
        if (failCommand) {
          this.handleCommand(failCommand, {}, this.parent ?? undefined)
        }
      }
      this.loading = false
    }, 500)
    
  }

  /**
   * 上传文件
   */
  async uploadFile (file: File | File[] | string, options: any, next: (doc: any, err?: Error) => void)  {
    try {
      if (options.type === 'avatar') {
        let result = await this.handleUpdateAvatar(file as File | string)
        next(result)
      }
    } catch (error) {
      next(null, error)
    }
  }

  /**
   * 更新/上传头像
   */
  async handleUpdateAvatar (file: File | string) {
    let url = ''
    let { upload, save } = this.avatarOptions
    if ( typeof file === 'object') {
      let formData = new FormData()
      formData.append('file[]', file)
      let result = await this.$httpClient(this.httpOptions).upload<HttpResult<PutResult[]>>(upload!, formData)
      if (result?.error) {
        throw new Error(result.error)
      }
      if (result?.data) {
        url = result.data[0].url
      }
    }
    else {
      url = file
    }
    let info = await this.$httpClient(this.httpOptions)[save?.method!](save?.url!, parseParams(this.avatarOptions.save?.params!)({ url })) as HttpResult
    if (info?.error) {
      throw new Error(info.error)
    }
    this.$store.commit(this.types.auth.AVATAR, info?.data.avatar)
    return url
  }

  /**
   * 运行指令集
   */
  handleCommand (value: string, row?: Record<string, any>, component?: Vue | Record<string, any>) {
    return runCommand(this, {
      action: async (type: string, row: Record<string, any> | null, a) => {
        // console.log(type, row, component)
        let action = get(this.actionOptions, type)
        if (action) {
          let { request, confirm, method, submitOptions } = action as Channel.ActionOptions
          if (confirm) {
            await this.actionConfirm(action, row!)
          }
          else if (submitOptions) {
            if (component && !component?.$el) {
              let values = {}
              for (let key of Object.keys(component!)) {
                if (get(row, key) !== get(component, key)) {
                  set(values, key, get(component, key))
                }
              }
              if (isEmpty(values)) return
              let IRequest = cloneDeep(request) ?? {}
              IRequest.url = parseTemplate(request?.url ?? '', { row })
              this.handleSubmit(values, IRequest, submitOptions)
            }
            else {
              let conditions = cloneDeep(this.conditions)
              if (submitOptions.pagination === 'remote') {
                conditions = merge(this.conditions, { page: this.pageno })
              }
              setTimeout(() => {
                this.handleSubmit(conditions, request!, submitOptions!)
              }, 300)
              
            }
              
          }
          else if (method) {
            if (component) {
              get(component, method)()
            }
          }
          else {
            this.handleGetData(request!, null, data => {})
          }
        }
        else {
          this.env.display = type
          this.selected = row ?? null
          this.selection = []
        }
      },
      dialog: async (type: string, row: Record<string, any> | null, component?: Vue) => {
        this.env.dialog = type
        this.selected = row ?? null
        this.parent = component ?? null
      },
      view: () => {
        this.drawerOptions = {
          key: 'view',
          name: '页面配置',
          placement: 'right',
          width: 960
        }
      }
    })(value, row, component)
  }

  async actionConfirm (config: Channel.ActionOptions, row?: Record<string, any>) {
    if (!row) {
      return this.$message.warning(`缺少操作对象！`)
    }
    let { request, confirm, submitOptions } = config
    let { afterCommand, success } = submitOptions ?? {}
    let options: ElMessageBoxOptions = {
      confirmButtonText    : '确定',
      cancelButtonText     : '取消',
      type                 : 'warning'
    }
    try {
      await this.$confirm(confirm?.message!, confirm?.title ?? '提示', options)
      let { method, url, params  } = request!
      let Iurl = parseTemplate(url ?? '', this.env)
      let IParams = parseParams(params ?? {})(this.env)
      let result = await this.$httpClient(this.httpOptions)[method ?? 'POST'](Iurl, IParams) as HttpResult<any>
      if (result.error) {
        this.$message.error(result.error)
      }
      else {
        this.$message.success(success ?? '信息已更新')
        if (afterCommand) {
          for (let item of afterCommand) {
            this.handleCommand(item, {}, this.parent ?? undefined)
          }
        }
      }
    } catch (error) {
      this.$message.info(confirm?.cancel ?? `您已取消操作`)
    }
  }

  handleCloseDrawer () {
    // this.drawerVisible = false
    this.drawerOptions = { key: '' }
  }

  /**
   * 查询验证 用户名/邮箱/手机号重名
   */
  async handleUnique (name: string, path: string | null, type: string) {
    let { url, params, headers } = this.uniqueOptions
    let Iurl = parseTemplate(url ?? '', { type })
    let Iparams = parseTemplate(params ?? '', { name, _id: get(this, path!) })
    let values = jsYaml.safeLoad(Iparams)
    let httpOptions: HttpClientOptions = merge(this.httpOptions, { headers })
    try {
      let result = await this.$httpClient(httpOptions).PUT<HttpResult<boolean>>(Iurl, values)
      if (result?.error) {
        return false
      }
      return true
    } catch (error) {
      return true
      // this.$message.warning(error.message)
    }
  }
  
}
</script>