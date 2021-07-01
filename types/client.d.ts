
import { ChannelDataNode, HeaderOptions, FilterQuery } from '@kenote/common'
import { FilterData, ParseData } from 'parse-string'
import { Method } from 'axios'
import { IncomingHttpHeaders } from 'http'
import { AxiosRequestConfig } from 'axios'
import { Account } from './account'

export type HttpClientOptions = HeaderOptions<AxiosRequestConfig>

export interface HttpResult<T = any> {
  data   ?: T
  error  ?: string
}

export declare namespace Command {

  type type = 'dialog' | 'action' | 'command' | 'router' | 'http'

  interface value {
    type     : type
    path     : string
  }
}

export declare namespace NavMenu {

  interface DataItem {
    key           ?: string
    name           : string
    description   ?: string
    link          ?: string
    buttons       ?: DataItem[]
    icon          ?: string
  }

  interface RootDataItem extends DataItem {
    type          ?: 'link' | 'dropdown' | 'notification'
    data          ?: Array<DataItem>
    props         ?: Record<string, string>
    trigger       ?: 'hover' | 'click'
    more          ?: MoreItem
  }

  interface Configure {
    navmenu        : NavMenu.RootDataItem[]
    authpanel      : AuthPanel
    avatar         : AvatarOptions
  }

  interface AvatarOptions {
    default       ?: string
    baseUrl        : string
    data           : Array<{ key: string, name: string }>
    save          ?: Channel.RequestConfig
    upload        ?: string
  }

  interface MoreItem {
    name          ?: string
    link          ?: string
  }

  interface AuthPanel {
    trigger       ?: 'hover' | 'click'
    top           ?: DataItem[]
    main          ?: DataItem[]
    exit          ?: MoreItem
    avatar        ?: string
  }
}

export declare namespace Channel {

  type DataNode = ChannelDataNode<PlusNode>
  type FormItemType = 
    | 'input' 
    | 'input-number' 
    | 'input-password'
    | 'radio' | 'radio-button' 
    | 'checkbox' | 'checkbox-button' 
    | 'select' 
    | 'group-picker' | 'avatar-picker' | 'item-picker'
    | 'year' | 'month' | 'date' | 'dates' | 'week' | 'datetime' | 'time' | 'datetimerange' | 'daterange' | 'monthrange' | 'timerange'
    | 'switch'
    | 'slider'
    | 'color-picker'
    | 'cascader' | 'cascader-panel'
    | 'rate'
    | 'transfer'
    | 'codemirror'
    | 'textarea' 
    | 'text'
  type FormItemData = Record<string, any>

  interface PlusNode {
    type          ?: string
    keywords      ?: string[]
    queryer       ?: RequestConfig
    example       ?: Example | string  // 此项可能会去掉
    refresh       ?: boolean
    configuration ?: Configuration | string
    conditions    ?: FilterQuery<any> | string
    disabled      ?: boolean | FilterQuery<any> | string
  }

  interface Configuration {
    tools         ?: Tool[]
    components    ?: Component[]
    uniqueOptions ?: RequestConfig
    env           ?: Record<string, any>
    actions       ?: Record<string, ActionOptions>
    initialData   ?: InitialData
    pageSize      ?: number
  }

  interface InitialData {
    request       ?: RequestConfig
    submitOptions ?: SubmitOptions
  }

  interface ActionOptions {
    request       ?: RequestConfig
    confirm       ?: ConfirmOptions
    method        ?: string
    submitOptions ?: SubmitOptions
  }

  interface ConfirmOptions {
    title         ?: string
    message        : string
    cancel        ?: string
  }

  interface Container {
    key           : string
    /**
     * horizontal 水平 ｜ vertical 垂直
     */
    layout        ?: 'horizontal' | 'vertical'
    components    ?: Component[]
  }

  interface Tool {
    key           : string
    name         ?: string
    icon         ?: string
    command      ?: string
  }

  interface Component {
    key            : string
    name           : string
    options        : Record<string, any>
    conditions    ?: FilterQuery<any> | string
  }

  interface Example {
    display       ?: ExampleDisplay[]
    attributes    ?: ExampleAttributes[]
  }

  interface ExampleDisplay {
    key            : string
    name           : string
    layout        ?: 'horizontal' | 'vertical'
    tabPanes       : ExampleTabPane[]
    active         : string
    preview       ?: ExamplePreview
  }

  interface ExampleTabPane {
    key            : string
    name           : string
    codemirror     : ExampleCodeMirror
  }

  interface ExampleCodeMirror {
    type          ?: string
    code          ?: string
  }

  interface ExamplePreview {
    description   ?: string
    component      : string
    options        : Record<string, any>
    value         ?: string | number
    callback      ?: boolean
    styles        ?: Record<string, any>
    height        ?: string
  }

  interface ExampleAttributes {
    key            : string
    name           : string
    description   ?: string
    columns        : TableColumn[]
    data           : Record<string, any>[]
  }

  // 查询器
  interface Queryer {
    api            : RequestConfig
    columns       ?: FormItem[]
    submitOptions ?: SubmitOptions
  }

  interface RequestConfig {
    method        ?: Method
    url           ?: string
    headers       ?: IncomingHttpHeaders
    params        ?: any
    loading       ?: boolean
    conditions    ?: FilterQuery<any> | string
  }

  // 表单器
  interface Form {
    /**
     * 标题名称
     */
    name          ?: string
    /**
     * 单元元素
     */
    columns       ?: FormItem[]
    /**
     * 验证规则
     */
    rules         ?: Record<string, Array<Verify.Rule>>
    /**
     * 表单提交地址
     */
    action        ?: RequestConfig
    /**
     * 排除字段
     */
    exclude       ?: string[]
    /**
     * 合并字段
     */
    merge         ?: Record<string, string[]>
    /**
     * 提交按钮名称
     */
    submitName    ?: string
    /**
     * 起始默认值
     */
    defaultValues ?: Record<string, any> | string
    /**
     * 提交选项
     */
    submitOptions ?: SubmitOptions
    /**
     * 格式化提交值
     */
    valueFormat   ?: Record<string, ParseData.format | ParseData.format[]>
    /**
     * 验证码选项
     */
    verifyCode    ?: verifyCodeOptions
  }

  /**
   * 验证码选项
   */
  interface verifyCodeOptions {
    type           : Account.verifyUserType
    associate     ?: string
  }

  // 表单单元
  interface FormItem {
    /**
     * 字段名称
     */
    key            : string
    /**
     * 字段 Label
     */
    name          ?: string
    /**
     * 单元类型
     */
    type          ?: FormItemType
    /**
     * 占位描述
     */
    placeholder   ?: string | string[]
    /**
     * 禁用状态
     */
    disabled      ?: boolean | FilterQuery<any> | string
    /**
     * 指定单元宽度
     */
    width         ?: number | 'auto'
    /**
     * 指定单元高度
     */
    height         ?: number
    /**
     * 多项选择时的数据
     */
    data          ?: FormItemData[]
    /**
     * data 键名配置选项
     */
    props         ?: Record<string, string> 
    /**
     * 获取异步选项数据
     */
    request       ?: RequestConfig
    /**
     * 最大值
     */
    min           ?: number
    /**
     * 最小值
     */
    max           ?: number
    /**
     * 步进
     */
    step         ?: number
    /**
     * 多项选择时支持多选
     */
    multiple      ?: boolean
    /**
     * 单选/多选时是否显示边框
     */
    border        ?: boolean
    /**
     * 显示的格式
     */
    format        ?: string
    /**
     * 指定输出的格式
     */
    valueFormat   ?: string
    /**
     * 日期范围选择时选中日期所使用的当日内具体时刻
     */
    defaultTime   ?: string[]
    /**
     * 单元特殊选项
     */
    options       ?: Record<string, any>
    /**
     * 显示条件
     */
    conditions    ?: FilterQuery<any> | string
  }

  interface SubmitOptions {
    /**
     * 开启重置按钮
     */
    reset         ?: string
    /**
     * 开启返回按钮
     */
    goback        ?: string
    /**
     * 提交成功信息
     */
    success       ?: string
    /**
     * 提交成功后本地store存储指令
     */
    commit        ?: string
    /**
     * 存储提交值
     */
    commitValue   ?: string
    /**
     * 有变化才提交
     */
    changeSubmit  ?: string
    /**
     * 提交间隔，单位：秒
     */
    step          ?: number
    /**
     * 回调更新
     */
    next          ?: (values: Record<string, any>) => void
    /**
     * 完成后调用指令
     */
    afterCommand  ?: string[]
    /**
     * 操作选项
     */
    emit          ?: EmitOptions[]
    /**
     * 回调赋值
     */
    assignment    ?: Record<string, string>
    /**
     * 分页模式
     */
    pagination    ?: string
  }

  // 表格单元
  interface TableColumn {
    /**
     * 字段名称
     */
    key            : string
    /**
     * 字段 Label
     */
    name          ?: string
    /**
     * 列宽度
     */
    width         ?: number
    /**
     * 列最小宽度
     */
    minWidth      ?: number
    /**
     * 是否固定两端
     */
    fixed         ?: boolean | 'left' | 'right'
    /**
     * 位置
     */
    align         ?: 'left' | 'center' | 'right'
    /**
     * 格式化
     */
    format        ?: ParseData.format | ParseData.format[]
    /**
     * 模版
     */
    template      ?: string
    /**
     * 状态
     */
    status        ?: StatusOptions[]
    /**
     * 剪贴板
     */
    clipboard     ?: boolean
    /**
     * 默认值
     */
    defaultValue  ?: string | number
    /**
     * 操作选项
     */
    emit          ?: EmitOptions[]
    /**
     * 列排序
     */
    sortable      ?: boolean | 'custem'
  }

  /**
   * 状态选项
   */
  interface StatusOptions {
    /**
     * 字段名称
     */
    key            : string
    /**
     * 字段 Label
     */
    name           : string
    /**
     * 类型
     */
    type           : string
    /**
     * 显示条件
     */
    conditions    ?: FilterQuery<any> | string
  }

  /**
   * 操作选项
   */
  interface EmitOptions {
    /**
     * 字段名称
     */
    key            : string
    /**
     * 字段 Label
     */
    name           : string
    /**
     * 字段类型
     */
    type           : 'link-text' | 'button' | 'dropdown'
    /**
     * 样式风格
     */
    style         ?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
    /**
     * 禁用状态
     */
    disabled      ?: boolean | FilterQuery<any> | string
    /**
     * 选择下拉时的选项
     */
    options       ?: EmitDropdownOption[]
  }

  /**
   * 选择下拉时的选项
   */
  interface EmitDropdownOption {
    /**
     * 字段名称
     */
    key            : string
    /**
    * 字段 Label
    */
    name           : string
    /**
     * 禁用状态
     */
    disabled      ?: boolean | FilterQuery<any> | string
  }

}

export declare namespace EditorConfig {

  interface Emoji {
    key           : string
    value         : string
  }
}

export declare interface EditorConfig {
  /**
   * 表情包
   */
  emoji          ?: Record<string, string>
}

export declare namespace Verify {

  type Rule = Partial<Omit<FilterData.rule, 'validator'>> & Verify.PlusFields

  type Validator = (rule: any, value: any, done: (message?: string) => any) => (message?: string) => any
  type PromiseValidtor = (rule: any, value: any, done: (message?: string) => any) => Promise<(message?: string) => any>

  interface PlusFields {
    type          ?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'data' | 'url' | 'hex' | 'email'
    trigger       ?: 'blur' | 'change' | Array<'blur' | 'change'>
    validator     ?: Validator | PromiseValidtor | Array<string | number | boolean>
  }
}