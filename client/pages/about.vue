<template>
  <page>
    <h1>About page</h1>
    <div>
      <el-date-picker
        v-model="value1"
        type="date"
        placeholder="选择日期">
      </el-date-picker>
      <el-date-picker
        v-model="value2"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
    </div>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'

@Component<R>({
  layout: 'homepage',
})
export default class R extends Vue {

  @Provide() value1: string = ''
  @Provide() value2: string[] = []
  
}
</script>