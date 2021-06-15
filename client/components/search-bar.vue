<template>
  <div class="searchbar">
    <el-autocomplete 
      ref="searchBar"
      size="small" 
      prefix-icon="el-icon-search" 
      v-model="search" 
      :fetch-suggestions="querySearch"
      @select="handleCommand"
      :placeholder="placeholder" >
      <i v-show="search" class="el-icon-error el-input__icon" slot="suffix" @click="handleClear"></i>
      <div slot-scope="{ item }">
        <div v-if="item.maps" class="name">
          <template v-for="(ret, key) in item.maps">
            <fragment :key="key">
              <span v-if="key > 0"> &gt; </span>
              <span v-html="ret.name.replace(new RegExp(`(${trim(search)})`, 'gi'), `<span class='keywords'>$1</span>`)">{{ ret.name }}</span>
            </fragment>
          </template>
        </div>
        <div v-else class="name">{{ item.value }}</div>
        <span v-if="item.description" class="description">{{ item.description }}</span>
      </div>
    </el-autocomplete>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Emit, Watch, Model, mixins } from 'nuxt-property-decorator'
import { Autocomplete } from 'element-ui'
import { filterDataNode, parseProps } from '@/utils'
import { CommonDataNode, initMaps } from '@kenote/common'
import { trim } from 'lodash'
import ruleJudgment from 'rule-judgment'
import EnvironmentMixin from '~/mixins/environment'

@Component<SearchBar>({
  name: 'search-bar',
  mounted () {
    this.search = this.value
    this.restaurants = initMaps(this.data)
  }
})
export default class SearchBar extends mixins(EnvironmentMixin) {

  @Prop({ default: '搜索内容' })
  placeholder!: string

  @Prop({ default: undefined })
  data!: CommonDataNode[]

  @Prop({ default: undefined })
  props!: Record<string, string>

  @Provide()
  search: string = ''

  @Provide()
  restaurants: CommonDataNode[] = []

  @Model('update')
  value!: string

  @Watch('search')
  onSearchChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.update(val)
  }

  @Watch('value')
  onValueChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.search = val
  }

  @Watch('data')
  onDataChange (val: CommonDataNode[], oldVal: CommonDataNode[]) {
    if (val === oldVal) return
    this.restaurants = initMaps(val)
  }

  @Emit('update')
  update (value: string) {}

  @Emit('command')
  handleCommand (value: string) {}

  trim = trim

  querySearch (queryString: string, cb: (info: Record<string, any>[]) => void) {
    let list: CommonDataNode[] = []
    filterDataNode(this.restaurants, trim(queryString), list)
    let filter = ruleJudgment({ 
      conditions: {
        $where: vulue => this.isFilter(vulue)
      } 
    })
    cb(list.filter(filter).map(parseProps(this.props ?? { value: 'name', key: 'key', description: 'description', maps: 'maps' })))
  }

  handleClear () {
    this.search = ''
    let searchBar = this.$refs['searchBar'] as Autocomplete
    setTimeout(() => {
      searchBar.focus()
    }, 300)
  }

}
</script>