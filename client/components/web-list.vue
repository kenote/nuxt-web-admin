<template>
  <ul v-if="data" class="web-list">
    <li v-for="(item, key) in data" :key="item.key || key" @click="handleCommand(item.link)">
      <i v-bind:class="item.icon || 'el-icon-menu'"></i>
      <span>{{ item.name }}</span>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, Emit } from 'nuxt-property-decorator'
import { get } from 'lodash'
import { NavMenu } from '@/types/client'


@Component<WebList>({
  name: 'web-list',
  created () {
    
  }
})
export default class WebList extends Vue {

  @Prop({ default: undefined })
  data!: NavMenu.DataItem[]

  @Emit('command')
  handleCommand (value: string) {}
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