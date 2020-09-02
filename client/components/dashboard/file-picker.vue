<template>
  <fragment>
    <el-button @click="handleSelectFile" :style="buttonStyle">选择文件</el-button>
    <input ref="uploadFile" 
      type="file" 
      :accept="accept" 
      v-show="false" 
      @change="handleSelectFileChange" />
      <slot></slot>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { Input as ElInput} from 'element-ui'

interface InputFile extends ElInput {
  click: () => void
}

@Component<DashboardFilePicker>({
  name: 'dashboard-file-picker'
})
export default class DashboardFilePicker extends Vue {
  
  @Prop({ default: undefined }) accept!: string
  @Prop({ default: undefined }) buttonStyle!: Record<string, any> | string

  handleSelectFile (): void {
    let theInput: InputFile = this.$refs['uploadFile'] as InputFile
    theInput.click()
  }

  handleSelectFileChange (evt: any): void {
    let files = evt.target!['files'] as FileList
    this.$emit('change', Array.from(files))
  }
}
</script>