<template>
  <div>
    <div class="avatar-picker" @click="handleOpenSelect">
      <el-avatar icon="el-icon-user-solid" :src="values || options.default"></el-avatar>
    </div>

    <!-- Dialog -->
    <el-dialog 
      :title="`修改头像`" 
      width="860px"  
      :visible="dialog.visible" 
      :append-to-body="true"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      @close="handleCloseSelect(false)">
      <section :style="bodyStyles" v-loading="loading">
        <div v-if="mode === 'cropp'" class="cropper-wrapper">
          <cropper ref="cropper"
            :src="imgsrc"
            :container-style="{ height: '300px', width: '500px' }"
            :view-mode="1"
            :drag-mode="'move'"
            :initial-aspect-ratio="width / height"
            :aspect-ratio="width / height"
            :min-crop-box-width="120"
            :min-crop-box-height="120"
            :auto-crop-area="0.8"
            preview=".preview"
            />
          <div class="preview" />
        </div>
        <el-upload v-else-if="mode === 'upload'"
          class="upload-files"
          drag
          action="/upload"
          accept=".jpeg,.png,.webp"
          :http-request="handleHttpRequest"
          :show-file-list="false"
          >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            <p>将文件拖到此处，或<em>点击上传</em></p>
            <p>支持文件格式： jpeg / png / webp </p>
          </div>
        </el-upload>
        <div v-else-if="mode === 'select'" class="select-wrapper">
          <div class="select-container">
            <perfect-scrollbar :options="{ suppressScrollX: true }">
              <el-row :gutter="4">
                <el-col :span="8" v-for="(item, key) in options.data" :key="key">
                  <el-image 
                    :style="{ width: '120px', height: '120px' }"
                    :src="options.baseUrl + item.name"
                    fit="cover"
                    :class="dialog.value == item.key ? 'active' : ''"
                    @click="handleSelectAvatar(item)"
                    :alt="item.key"
                    />
                </el-col>
              </el-row>
            </perfect-scrollbar>
          </div>

          <div class="preview" >
            <el-image v-if="dialog.value"
              :style="{ width: '200px', height: '200px' }"
              :src="getAvatarUrl(dialog.value)"
              fit="cover"
              :alt="dialog.value"
              />
          </div>
        </div>
      </section>
      <span slot="footer" class="dialog-footer">
        <div class="dialog-footer-left" v-if="isUpload">
          <el-button @click="mode = 'select'" :disabled="mode === 'select' || loading ? true : false">默认头像</el-button>
          <el-button type="success" @click="mode = 'upload'" :disabled="mode === 'upload' || loading ? true : false">上传</el-button>
        </div>
        <el-button @click="handleCloseSelect(false)">取 消</el-button>
        <el-button type="primary" @click="handleCloseSelect(true)" :disabled="mode === 'upload' || (mode === 'select' && !dialog.value) ? true : false" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit, Model, Watch } from 'nuxt-property-decorator'
import { HttpRequestOptions } from 'element-ui/types/upload'
import { readImageFile } from '@/utils/file'
import { VueCropperMethods } from 'vue-cropperjs'
import { getUrl } from '@/utils'
import { NavMenu } from '@/types/client'
import urlParse from 'url-parse'

interface DialogOptions {
  visible   ?: boolean
  value     ?: any
}

@Component<AvatarPicker>({
  name: 'avatar-picker',
  created () {
    this.values = this.value
  }
})
export default class AvatarPicker extends Vue {

  /**
   * 裁剪后文件类型
   */
  @Prop({ default: 'image/webp' })
  fileType!: string

  /**
   * 裁剪后图像质量
   */
  @Prop({ default: 0.75 })
  quality!: number

  @Prop({ default: 200 })
  width!: number

  @Prop({ default: 200 })
  height!: number

  @Prop({ default: 'avatar.webp' })
  filename!: string

  @Prop({ default: undefined })
  options!: NavMenu.AvatarOptions

  @Prop({ default: false })
  isUpload!: boolean

  @Provide()
  dialog: DialogOptions = {}

  @Provide()
  bodyStyles: Record<string, any> = { height: '300px' }

  @Provide()
  imgsrc: string = ''

  @Provide()
  mode: string = 'select'

  @Provide()
  loading: boolean = false
  
  @Provide()
  values: any = ''

  @Model('update')
  value!: string

  @Emit('update')
  update (value: string) {}

  @Emit('upload-file')
  uploadFile (file: File | string, options: any, next: (doc: any, err?: Error) => void) {}

  @Watch('value')
  onValueChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.values = val
  }

  @Watch('mode')
  onModeChange (val: string, oldVal: string) {
    if (val === oldVal) return
    let cropper = this.$refs['cropper'] as unknown as VueCropperMethods
    if (cropper) {
      cropper.destroy()
    }
  }

  /**
   * 打开选择器
   */
  handleOpenSelect () {
    if (this.mode === 'select' && this.values) {
      let { pathname } = urlParse(this.values)
      let [, name ] = pathname.split(new RegExp(`${this.options.baseUrl}`, 'gi'))
      let item = this.options.data.find( f => f.name === name )
      this.dialog = { visible: true, value: item?.key }
    }
    else {
      this.dialog = { visible: true }
    }
  }

  /**
   * 关闭选择器
   */
  async handleCloseSelect (confirm: boolean = false) {
    if (confirm) {
      let file: File | string | null = null
      let cropper = this.$refs['cropper'] as unknown as VueCropperMethods
      if (cropper) {
        let canvas = cropper.getCroppedCanvas({ width: this.width, height: this.height })
        let blob = await new Promise( resolve => canvas.toBlob( d => resolve(d as Blob), this.fileType, this.quality )) as Blob
        file = new File([blob], this.filename, { type: blob.type })
      }
      else if (this.dialog.value) {
        file = this.getAvatarUrl(this.dialog.value)
      }
      if (!file) return
      
      // 上传文件
      this.loading = true
      this.uploadFile(file, { type: 'avatar' }, async (result, error) => {
        if (error) {
          this.$message.error(error.message)
          this.loading = false
        }
        if (result) {
          this.update(getUrl(result))
          await this.handleCloseSelect(false)
        }
      })
      
      return
    }
    this.dialog = { visible: false }
    this.imgsrc = ''
    this.mode = 'select'
    this.loading = false
  }

  // 选择上传文件
  async handleHttpRequest (httpRequest: HttpRequestOptions) {
    let { file } = httpRequest
    try {
      this.imgsrc = await readImageFile<string>(file)
      this.mode = 'cropp'
    } catch (error) {
      this.$message.error((<Error>error)?.message)
    }
  }

  // 选中默认头像
  handleSelectAvatar (item: { key: string, name: string }) {
    this.dialog = { visible: true, value: item.key }
  }

  // 获取默认头像URL
  getAvatarUrl (key: string) {
    let { baseUrl, data } = this.options
    let item = data.find( r => r.key === key )
    if (!item) return ''
    return baseUrl + item.name
  }
}


</script>

<style lang="scss">
.avatar-picker {
  display: inline-block;
  width: 80px;
  height: 80px;
  margin-left: 20px;
  
  .el-avatar {
    width: 80px;
    height: 80px;
    font-size: 50px;
    line-height: 80px;
  }
}

.upload-files {
  height: 300px;

  .el-upload {
    width: 100%;
    height: inherit;
    .el-upload-dragger {
      width: inherit;
      height: inherit;
      .el-icon-upload {
        margin-top: 80px;
      }
      .el-upload__text p {
        margin: 4px;
      }
    }
  }
}

.cropper-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .cropper-container {
    border: 1px solid #c2c2c2;
  }

  .cropper-modal {
    background-color: #666;
    opacity: 0.3;
  }

  .preview {
    width: 200px;
    height: 200px;
    overflow: hidden;
    margin: 50px;
    border-radius: 50%;
  }
}

.select-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: inherit;

  .select-container {
    border: 1px solid #c2c2c2;
    width: 500px!important;
    height: inherit!important;
    overflow-y: auto;
    

    .ps {
      margin-top: 0;
      height: 100%;
    }

    .el-row {
      padding: 13px 20px 13px 20px;
    }

    .el-col {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px 0;

      .el-image {
        padding: 3px;
        border: 2px transparent solid!important;
        border-radius: 4px;
        opacity: .7;
        transition: all 1.2s;

        &:hover, &.active {
          border-color: #57aafd!important;
          opacity: 1;
        }
      }
    }
  }

  .preview {
    width: 200px;
    height: 200px;
    overflow: hidden;
    margin: 50px;
    border-radius: 50%;
    background-color: #f1f1f1;
  }
}
</style>