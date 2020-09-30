<template>
  <div v-if="value">
    <el-tag closable :disable-transitions="false" @close="handleRemove">{{ value.name }}</el-tag>
  </div>
  <dashboard-file-picker v-else @change="handleFileChange" />
</template>

<script lang="ts">
import { Component, Vue, Model } from 'nuxt-property-decorator'

@Component<DashboardFileInput>({
  name: 'dashboard-file-input'
})
export default class DashboardFileInput extends Vue {

  @Model('update') value!: any

  handleFileChange (files: File): void {
    this.$emit('update', files[0])
  }

  handleRemove (): void {
    this.$emit('update', undefined)
  }
  
}
</script>