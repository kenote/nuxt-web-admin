<template>
  <el-input 
    ref="searchBar"
    size="small" 
    prefix-icon="el-icon-search" 
    v-model="search" 
    :placeholder="placeholder" >
    <i v-show="search" class="el-icon-error el-input__icon" slot="suffix" @click="handleClear"></i>
    
  </el-input>
</template>

<script lang="ts">
import { Component, mixins, Prop, Provide, Emit, Watch, Model } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import { Autocomplete } from 'element-ui'

@Component<SearchBar>({
  name: 'search-bar',
  
})
export default class SearchBar extends mixins(BaseMixin) {

  @Prop({ default: '搜索内容' })
  placeholder!: string

  @Provide()
  search: string = ''

  @Model('update')
  value!: string

  @Watch('search')
  onSearchChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.$emit('update', val)
  }

  @Watch('value')
  onValueChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.search = val
  }

  querySearch (queryString, cb) {

    cb([
      { value: 'www', address: 'ddd' }
    ])
  }

  handleClear () {
    let searchBar = this.$refs['searchBar'] as Autocomplete
    this.search = ''
    searchBar.focus()
  }

}
</script>