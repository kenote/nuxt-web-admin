<template>
  <ul v-if="data" class="web-list">
    <template v-for="(item, key) in data">
      <li :key="item.key || key" v-if="isFilter(item.conditions) && isExclude(item)" @click="handleCommand(item.link)">
        <i v-bind:class="item.icon || 'el-icon-menu'"></i>
        <span>{{ item.name }}</span>
      </li>
    </template>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Emit, mixins } from 'nuxt-property-decorator'
import { NavMenu } from '@/types/client'
import EnvironmentMixin from '~/mixins/environment'
import { get } from 'lodash'

@Component<WebList>({
  name: 'web-list'
})
export default class WebList extends mixins(EnvironmentMixin) {

  @Prop({ default: undefined })
  data!: NavMenu.DataItem[]

  @Prop({ default: undefined })
  exclude!: string[]

  @Prop({ default: 'key' })
  excludeKey!: string

  @Emit('command')
  handleCommand (value: string) {}

  isExclude (item: NavMenu.DataItem) {
    if (!this.exclude) return true
    return this.exclude.includes(get(item, this.excludeKey))
  }
}
</script>

<style lang="scss" scoped>
.web-list {
  list-style-type: none;
  margin: 8px 0;
  padding: 0;

  li {
    margin: 0;
    padding: 8px 15px;
    line-height: 24px;
    color: #666;
    cursor: pointer;

    i {
      margin-right: 10px;
      width: 15px;
      display: inline-block;
    }

    &:hover {
      background-color: #f4f6f7;

      i {
        color: #f60;
      }
    }
  }
}
</style>